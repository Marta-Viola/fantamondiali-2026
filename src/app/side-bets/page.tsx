// /side-bets

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StandardHeader from '@/components/ui/StandardHeader'
import SideBetsForm from '@/components/SideBetsForm'
import RealtimeSettingsListener from '@/components/RealtimeSettingsListener'
import Countdown from '@/components/ui/Countdown'
import SideBetsSummaryCard from '@/components/SideBetsSummaryCard'

export const dynamic = 'force-dynamic'

export default async function SideBetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')


    const now = new Date()

    // impostazioni globali
    const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .single()

    // 🛑 TRUCCO PER TESTARE LA UI (DA CANCELLARE PRIMA DELLA PRODUZIONE)
    if (settings) {
        settings.current_phase = 'SEDICESIMI' // Spostiamo la fase ai sedicesimi
        settings.is_approved = true           // Forza lo stato attivo
        
        // TRUCCO INITIAL: Tutto nel futuro
        const dopodomani = new Date(now.getTime() + 48 * 60 * 60 * 1000)
        const domani = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        
        settings.voting_open_at = domani.toISOString() // Apre domani
        settings.voting_closed_at = dopodomani.toISOString() // Chiude dopodomani
    }

    // calcolo dei flag temporali
    const openAt = settings ? new Date(settings.voting_open_at) : new Date()
    const closedAt = settings ? new Date(settings.voting_closed_at) : new Date()
    
    // i 4 stati logici
    const isBlocked = settings ? !settings.is_approved : true
    const isInitial = settings.is_approved && now < openAt
    const isOpen = settings.is_approved && now >= openAt && now <= closedAt
    const isClosed = settings.is_approved && now > closedAt

    // riconoscere i round in base alla fase
    const isRound1 = settings?.current_phase === 'GIRONI'
    const isRound2 = settings?.current_phase === 'SEDICESIMI'

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
    } else if (isRound1) {
        // LOGICA ROUND 1 (GIRONI)
        if (isInitial) {
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
    } else if (isRound2) {
        // LOGICA ROUND 2 (SEDICESIMI)
        if (isInitial) {
            config = {
                title: "Seconda Chance in Arrivo ⏳",
                subtitle: "Preparati per il Round 2. I punti valgono la metà, ma tutto può succedere!",
                color: "bg-amber-500",
                showCountdown: true,
                countdownTarget: openAt,
                allowVoting: false,
                statusLabel: "Conto alla rovescia (Round 2)"
            }
        } else if (isOpen) {
            config = {
                title: "Seconda Chance ✌️",
                subtitle: "Nuove scommesse aperte! I pronostici di questo round valgono la metà dei punti originali.",
                color: "bg-emerald-600",
                showCountdown: false,
                countdownTarget: closedAt,
                allowVoting: true,
                statusLabel: "Mercato Aperto (Round 2)"
            }
        } else if (isClosed) {
            config = {
                title: "Scommesse Chiuse 🔒",
                subtitle: "Anche il secondo round di scommesse speciali è terminato.",
                color: "bg-rose-600",
                showCountdown: false,
                countdownTarget: closedAt,
                allowVoting: false,
                statusLabel: "Mercato Chiuso"
            }
        }
    } else {
        // STATO ROSSO AUTOMATICO (ottavi, quarti, ...)
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

    // 1. Recuperiamo le domande ordinate per round
    const { data: allBets } = await supabase.from('side_bets').select('*').order('round', { ascending: true })

    // smistamento logico delle domande
    const round1Bets = allBets?.filter(b => b.round === 1) || []
    const round2Bets = allBets?.filter(b => b.round === 2) || []

    // recuperiamo le risposte dell'utente
    const { data: existingAnswers } = await supabase
        .from('user_side_bets')
        .select('side_bet_id, answer, numeric_answer, is_correct')
        .eq('user_id', user.id)

    // smistamento logico delle risposte
    const round1Answers = existingAnswers?.filter(a => round1Bets.some(b => b.id === a.side_bet_id)) || []
    const round2Answers = existingAnswers?.filter(a => round2Bets.some(b => b.id === a.side_bet_id)) || []

    // Recuperiamo TUTTI i dati dei match per estrarre le squadre
    const { data: matches } = await supabase.from('matches').select('*')
    const teamsMap = new Map()
    matches?.forEach(m => {
        if (m.home_team) teamsMap.set(m.home_team, { name: m.home_team, flag: m.home_flag, tla: m.home_tla })
        if (m.away_team) teamsMap.set(m.away_team, { name: m.away_team, flag: m.away_flag, tla: m.away_tla })
    })
    const teams = Array.from(teamsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    
    // determiniamo quali scommesse passare al form principale in base alla fase
    const activeBets = isRound2 ? round2Bets : round1Bets
    const activeAnswers = isRound2 ? round2Answers : round1Answers

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

                {/* QUI ANDRà LA CARD DI RIEPILOGO */}
                {/* RIEPILOGO ROUND 1 (Sempre visibile se ci sono risposte) */}
                <SideBetsSummaryCard 
                    round={1} 
                    bets={round1Bets} 
                    answers={round1Answers} 
                    teams={teams} 
                />

                {/* RIEPILOGO ROUND 2 (Visibile solo dal Round 2 in poi) */}
                {(isRound2 || (!isRound1 && !isRound2)) && (
                    <SideBetsSummaryCard 
                        round={2} 
                        bets={round2Bets} 
                        answers={round2Answers} 
                        teams={teams} 
                    />
                )}

                {/* BLOCCO FORM DELLE SIDE BETS ATTIVE */}
                {!isBlocked && activeBets && activeBets.length > 0 ? (
                    <SideBetsForm
                        key={`${settings.current_phase}-${activeAnswers?.length || 0}`} 
                        bets={activeBets} 
                        teams={teams}
                        initialAnswers={activeAnswers || []}
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