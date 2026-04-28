import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictionForm from '@/components/PredictionForm'

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
        <div className="min-h-screen bg-emerald-50 pb-20">
            <header className="bg-emerald-600 text-white p-6 sticky top-0 z-10 shadow-md">
                <h1 className="text-2xl font-black uppercase text-center italic">Fase a Gironi ⚽</h1>
                <p className="text-center text-emerald-100 text-xs">Tutti i match del primo turno</p>
            </header>

            <main className="max-w-2xl mx-auto p-4">
                <PredictionForm
                    matches={matches || []}
                    existingPredictions={existingPredictions || []}
                />
            </main>
        </div>
    )
}