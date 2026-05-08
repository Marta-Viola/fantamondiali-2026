import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import PredictionForm from '../../components/PredictionForm'
import StandardHeader from '@/components/ui/StandardHeader'

export default async function PronosticiPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Carichiamo le partite della fase a gironi
    const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('stage', 'GROUP_STAGE')
        .order('match_time', { ascending: true })

    // 2. Carichiamo i pronostici già esistenti dell'utente
    const { data: existingPredictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

    return (
        <>
        <StandardHeader
                title="Fase a Gironi ⚽"
                subtitle="Tutti i match del primo turno"
            />
        <div className="min-h-screen bg-emerald-50 pb-20">

            <main className="max-w-2xl mx-auto p-4">
                <PredictionForm
                    matches={matches || []}
                    existingPredictions={existingPredictions || []}
                />
            </main>
        </div>
        </>
    )
}