import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import StandardHeader from '@/components/ui/StandardHeader'
import StandardFooter from '@/components/ui/StandardFooter'
import RankingTable from '@/components/RankingTable'


export default async function ClassificaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: rankings } = await supabase
        .from('profiles')
        .select('id, username, total_points, outcomes_count, scores_count, previous_rank')
        .order('total_points', { ascending: false })
        .order('username', { ascending: true })

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

            <StandardFooter />
        </>
    )
}