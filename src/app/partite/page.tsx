import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StandardHeader from '@/components/ui/StandardHeader'
import StandardFooter from '@/components/ui/StandardFooter'
import MatchList from '@/components/MatchList'

export default async function PartitePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // carichiamo i match (già ordinati per tempo)
    const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['SCHEDULED', 'LIVE', 'IN_PLAY', 'FINISHED', 'POSTPONED'])
        .order('match_time', { ascending: true })

    // carichiamo i pronostici dell'utente loggato
    const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

    return (
        <>
            <StandardHeader 
                title="Calendario 🗓️"
                subtitle="Risultati e prossimi match"
            />

            <div className="min-h-screen bg-emerald-50 pb-20">
                <main className="max-w-3xl mx-auto p-4">
                    {matches && matches.length > 0 ? (
                        <MatchList matches={matches} predictions={predictions || []} />
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                            <p className="font-bold text-slate-400">Nessuna partita trovata.</p>
                        </div>
                    )}
                </main>
            </div>

            <StandardFooter />
        </>
    )
}