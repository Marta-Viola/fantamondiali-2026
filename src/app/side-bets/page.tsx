// /side-bets

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StandardHeader from '@/components/ui/StandardHeader'
import SideBetsForm from '@/components/SideBetsForm'
import RealtimeSettingsListener from '@/components/RealtimeSettingsListener'
import Countdown from '@/components/ui/Countdown'

export const dynamic = 'force-dynamic'

export default async function SideBetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // impostazioni globali
    const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .single()

    // calcolo dei flag temporali
    const now = new Date()
    const openAt = settings ? new Date(settings.voting_open_at) : new Date()
    const closedAt = settings ? new Date(settings.voting_closed_at) : new Date()
    
    // i 4 stati logici
    const isBlocked = settings ? !settings.is_approved : true
    const isInitial = settings.is_approved && now < openAt
    const isOpen = settings.is_approved && now >= openAt && now <= closedAt
    const isClosed = settings.is_approved && now > closedAt

    // configurazione dinamica dell'interfaccia
    let config = {
        title: "Scommesse Chiuse 🔒",
        subtitle: "Il mercato delle scommesse speciali è chiuso definitivamente.",
        color: "bg-rose-600",
        showCountdown: false,
        countdownTarget: closedAt,
        allowVoting: false,
        statusLabel: "Mercato Chiuso"
    }

    if (isBlocked) {
        config = {
            title: "Scommesse Sospese 🛑",
            subtitle: "La direzione gara sta aggiornando i mercati speciali.",
            color: "bg-slate-700",
            showCountdown: false,
            countdownTarget: now,
            allowVoting: false,
            statusLabel: "Manutenzione"
        }
    } else if (settings?.current_phase === 'GIRONI') {
        if (isInitial) {
            // STATO GIALLO (INITIAL)
            config = {
                title: "Scommesse Speciali in Arrivo ⏳",
                subtitle: "Prepara le tue scommesse speciali sul torneo!",
                color: "bg-amber-500",
                showCountdown: true,
                countdownTarget: openAt,
                allowVoting: false,
                statusLabel: "Conto alla rovescia"
            }
        } else if (isOpen) {
            // STATO VERDE (OPEN)
            config = {
                title: "Scommesse Speciali ⭐",
                subtitle: "Inserisci i tuoi pronostici speciali prima del fischio d'inizio!",
                color: "bg-emerald-600",
                showCountdown: false,
                countdownTarget: closedAt,
                allowVoting: true,
                statusLabel: "Mercato Aperto"
            }
        } else if (isClosed) {
            // STATO ROSSO (CLOSED)
            config = {
                title: "Scommesse Chiuse 🔒",
                subtitle: "Il mercato delle scommesse speciali è chiuso definitivamente",
                color: "bg-rose-600",
                showCountdown: false,
                countdownTarget: closedAt,
                allowVoting: false,
                statusLabel: "Mercato Chiuso"
            }
        }
    } else {
        // STATO ROSSO AUTOMATICO
        config = {
            title: "Scommesse Chiuse 🔒",
            subtitle: "Il torneo è entrato nella fase calda. Le scelte sono definitive.",
            color: "bg-rose-600",
            showCountdown: false,
            countdownTarget: closedAt,
            allowVoting: false,
            statusLabel: "Mercato Chiuso"
        }
    }

    // 1. Recuperiamo le domande
    const { data: bets } = await supabase.from('side_bets').select('*')

    // recuperiamo le risposte esistenti dell'utente
    const { data: existingAnswers } = await supabase
        .from('user_side_bets')
        .select('side_bet_id, answer')
        .eq('user_id', user.id)

    // Recuperiamo TUTTI i dati dei match per estrarre le squadre
    const { data: matches } = await supabase.from('matches').select('*')
    const teamsMap = new Map()
    matches?.forEach(m => {
        if (m.home_team) teamsMap.set(m.home_team, { name: m.home_team, flag: m.home_flag, tla: m.home_tla })
        if (m.away_team) teamsMap.set(m.away_team, { name: m.away_team, flag: m.away_flag, tla: m.away_tla })
    })
    const teams = Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    // const totalTeamsFound = teams.length
    
    return (
        <>
        <RealtimeSettingsListener />

        <StandardHeader
                title={config.title}
                subtitle={config.subtitle}
                className={config.color}
            />

        <div className="bg-emerald-50 pb-32 min-h-screen">
            <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

                {/* BANNER AVVISO STATO (compare solo se non si può votare) */}
                {!config.allowVoting && (
                    <div className={`p-6 rounded-[2rem] text-white shadow-xl ${config.color} border-b-4 border-black/20 transform transition-all`}>
                        <h2 className="font-black uppercase italic text-lg tracking-tight">
                            {config.statusLabel}
                        </h2>
                        <p className="text-xs font-bold opacity-90 mt-1 mb-4 leading-relaxed">
                            {isBlocked
                                ? "La regia ha temporaneamente bloccato i mercati. Torna tra pochissimo!"
                                : isInitial
                                ? "Le scommesse speciali aprono insieme alla fase a gironi."
                                : "I giochi sono fatti! non è più possibile inserire o modificare i pronostici speciali."
                            }
                        </p>

                        {config.showCountdown && (
                            <Countdown
                                targetDate={config.countdownTarget}
                                variant="default"
                            />
                        )}
                    </div>
                )}

                {/* BLOCCO FORM DELLE SIDE BETS */}
                {!isBlocked && bets && bets.length > 0 ? (
                    <SideBetsForm
                        key={`${settings.current_phase}-${existingAnswers?.length || 0}`} 
                        bets={bets} 
                        teams={teams}
                        initialAnswers={existingAnswers || []}
                        isLocked={!config.allowVoting}
                    />
                ) : (
                    <div className="text-center p-10 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                        <p className="text-slate-400 font-bold italic text-sm">
                            La direzione gara sta aggiornando i mercati speciali. Torna tra pochissimo!
                        </p>
                    </div>
                )}
            </main>
        </div>
        </>
    )
}