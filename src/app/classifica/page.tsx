import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import StandardHeader from '@/components/ui/StandardHeader'
import StandardFooter from '@/components/ui/StandardFooter'
import RankingTable from '@/components/RankingTable'
import LastUpdated from '@/components/ui/LastUpdated'


export default async function ClassificaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [rankingsRes, settingsRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .order('total_points', { ascending: false })
            .order('scores_count', { ascending: false })
            .order('gd_count', { ascending: false })
            .order('username', { ascending: true }),
        supabase
            .from('app_settings')
            .select('last_sync_at')
            .single()
    ])

    const rankings = rankingsRes.data || []
    const lastSync = settingsRes.data?.last_sync_at    // const { data: rankings } = await supabase
    //     .from('profiles')
    //     .select('*')
    //     .order('total_points', { ascending: false })
    //     .order('scores_count', { ascending: false })
    //     .order('gd_count', { ascending: false })
    //     .order('username', { ascending: true })

    return (
        <>
            <StandardHeader
                title="Classifica 📊"
                subtitle="Chi sta dominando il torneo?"
            />

            <div className="min-h-screen bg-emerald-50 pb-24">
                <main className="max-w-3xl mx-auto p-4">
                    <RankingTable users={rankings || []} currentUserId={user.id} />
                </main>
            </div>

            <LastUpdated date={lastSync}/>

            <StandardFooter />
        </>
    )
}