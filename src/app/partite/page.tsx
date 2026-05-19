import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StandardHeader from '@/components/ui/StandardHeader'
import StandardFooter from '@/components/ui/StandardFooter'
import MatchList from '@/components/MatchList'
import LastUpdated from '@/components/ui/LastUpdated'
import RealtimeSettingsListener from '@/components/RealtimeSettingsListener'

export const dynamic = 'force-dynamic'

export default async function PartitePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [matchesRes, predictionsRes, settingsRes] = await Promise.all([
        supabase
            .from('matches')
            .select('*')
            .in('status', ['scheduled', 'live', 'finished', 'postponed'])
            .order('match_time', { ascending: true }),
        supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id),
        supabase
            .from('app_settings')
            .select('last_sync_at')
            .single()
    ])

    const matches = matchesRes.data || []
    const predictions = predictionsRes.data || []
    const lastSync = settingsRes.data?.last_sync_at

    return (
        <>
            <RealtimeSettingsListener />

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

            <LastUpdated date={lastSync} />

            <StandardFooter />
        </>
    )
}