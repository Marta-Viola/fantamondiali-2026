import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictionForm from '../../components/PredictionForm'
import StandardHeader from '@/components/ui/StandardHeader'
import Countdown from '@/components/ui/Countdown'
import { PHASE_SCHEDULE } from '@/constants/phases'
import RealtimeSettingsListener from '@/components/RealtimeSettingsListener'

export const dynamic = 'force-dynamic'

export default async function PronosticiPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // CENTRALE DI COMANDO  
    const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .single()

    const now = new Date()
    const openAt = new Date(settings.voting_open_at)
    const closedAt = new Date(settings.voting_closed_at)

    // I 4 STATI LOGICI
    const isBlocked = !settings.is_approved
    const isInitial = settings.is_approved && now < openAt
    const isOpen = settings.is_approved && now >= openAt && now <= closedAt
    const isClosed = settings.is_approved && now > closedAt

    const phaseLabel = settings.current_phase.replace(/_/g, ' ')

    let config = {
        title: "", 
        subtitle: "", 
        color: "",
        showCountdown: false, 
        countdownTarget: openAt,
        allowVoting: false,
        statusLabel: ""
    }

    if (isBlocked) {
        config = {
            title: "Lavori in Corso 🛠️", 
            subtitle: "Il magazziniere sta gonfiando i palloni...", 
            color: "bg-slate-600",
            showCountdown: false,
            allowVoting: false,
            countdownTarget: now,
            statusLabel: "Aspetta un attimo!"
        }
    } else if (isInitial) {
        config = {
            title: "Fase in Arrivo ⏳",
            subtitle: "Preparati per i pronostici!",
            color: "bg-amber-500",
            showCountdown: true,
            allowVoting: false,
            countdownTarget: openAt,
            statusLabel: "Conto alla rovescia"
        }
    } else if (isOpen) {
        config = {
            title: `Pronostici ${settings.current_phase} ⚽`,
            subtitle: "Inserisci i tuoi voti ora!",
            color: "bg-emerald-600",
            showCountdown: false,
            allowVoting: true,
            countdownTarget: closedAt,
            statusLabel: "Mercato Aperto",
        }
    } else if (isClosed) {
        const phaseKey = settings.current_phase as keyof typeof PHASE_SCHEDULE
        const phaseData = PHASE_SCHEDULE[phaseKey]
        const nextPhaseDate = (phaseData as any).nextPhaseOpen || now
        config = {
            title: "Tempo Scaduto 🟥",
            subtitle: "I giochi sono fatti per questa fase!",
            color: "bg-rose-600",
            showCountdown: true,
            allowVoting: false,
            countdownTarget: new Date(nextPhaseDate),
            statusLabel: "Fase Conclusa"
        }
    }

    const stageMapper: Record<string, string[]> = {
        'GIRONI': ['GROUP_STAGE'],
        'SEDICESIMI': ['LAST_32'],
        'OTTAVI': ['LAST_16'],
        'QUARTI': ['QUARTER_FINALS'],
        'SEMIFINALI': ['SEMI_FINALS'],
        'FINALE': ['FINAL', 'THIRD_PLACE']
    }

    const apiStages = stageMapper[settings.current_phase] || settings.current_phase

    // CARICAMENTO PARTITE
    const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .in('stage', apiStages)
        .order('match_time', { ascending: true })

    // 2. Carichiamo i pronostici già esistenti dell'utente
    const { data: existingPredictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

    return (
        <>
        <RealtimeSettingsListener />

        <StandardHeader
                title={config.title}
                subtitle={config.subtitle}
                className={config.color}
        />

        <div className="bg-slate-50 pb-32">
            <main className="max-w-2xl mx-auto p-4 space-y-6">

                {/* AVVISO STATO */}
                {!config.allowVoting && (
                    <div className={`p-6 rounded-[2rem] text-white shadow-xl ${config.color} border-b-4 border-black/20 transform transition-all`}>
                        <h2 className="font-black uppercase italic text-lg tracking-tight">
                            {config.statusLabel}
                        </h2>
                        <p className="text-xs font-bold opacity-90 mt-1 mb-4 leading-relaxed">
                            {isBlocked
                                ? "Stiamo caricando le partite della nuova fase. Torna tra pochissimo!"
                                : isInitial
                                ? "Le votazioni non sono ancora aperte. Guarda quanto manca:"
                                : "I giochi sono fatti! Le votazioni sono chiuse per questa fase. Ecco quanto manca all'apertura della prossima fase:"}
                        </p>

                        {config.showCountdown && (
                            <Countdown 
                                targetDate={config.countdownTarget} 
                                variant="default" 
                            />
                        )}
                    </div>
                )}

                {/* LOGICA VISIBILITà FORM */}
                {(isOpen || isClosed || isInitial) ? (
                    <PredictionForm
                        key={`${settings.current_phase}-${existingPredictions?.length || 0}`}
                        matches={matches || []}
                        existingPredictions={existingPredictions || []}
                        isLocked={!config.allowVoting}
                />
                ) : (
                    <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="text-4xl mb-3 animate-pulse">🏟️</div>
                        <p className="font-bold text-slate-400 italic text-xs px-8 leading-relaxed">
                            I mercati sono temporaneamente chiusi. La Sala VAR sta preparando il tabellone.
                        </p>
                    </div>
                )}
            </main>
        </div>
        </>
    )
}