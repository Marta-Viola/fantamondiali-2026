// /side-bets

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StandardHeader from '@/components/ui/StandardHeader'
import SideBetsForm from '@/components/SideBetsForm'
import RealtimeSettingsListener from '@/components/RealtimeSettingsListener'

export const dynamic = 'force-dynamic'

export default async function SideBetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 1. Recuperiamo le domande
    const { data: bets } = await supabase.from('side_bets').select('*')
    // const { data: bets, error: betsError } = await supabase
    //     .from('side_bets')
    //     .select('*')
    //     .order('points_value', { ascending: false })

    // if (betsError) {
    //     console.error("ERRORE SUPABASE SIDE_BETS:", betsError)
    // }
    // console.log("DATI RECUPERATI:", bets)

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
    const totalTeamsFound = teams.length
    
    return (
        <>
        <RealtimeSettingsListener />
        <StandardHeader
                title="Scommesse Speciali ⭐"
                subtitle="Indovina il futuro del Mondiale e scala la classifica"
            />
        <div className="min-h-screen bg-slate-50 pb-20">
            
            
            {/* <header className="bg-emerald-600 text-white p-8 sticky top-0 z-40 shadow-md">
                <h1 className="text-2xl font-black uppercase italic text-center">Scommesse Speciali ⭐</h1>
                <p className="text-center text-emerald-100 text-xs">
                    Indovina vincitore, finalisti e capocannoniere per guadagnare punti extra
                </p>
            </header> */}

            <main className="max-w-2xl mx-auto px-4 mt-6">
                {bets && bets.length > 0 ? (
                    <SideBetsForm 
                        bets={bets} 
                        teams={teams}
                        initialAnswers={existingAnswers || []}
                    />
                ) : (
                    <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-slate-100 mt-10">
                        <p className="text-slate-500 font-bold italic">
                            Caricamento scommesse... Se non appaiono, chiedi a Marta.
                        </p>
                    </div>
                )}
            </main>
        </div>
        </>
    )
}