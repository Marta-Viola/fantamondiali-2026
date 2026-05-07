import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import PredictionForm from '../../components/PredictionForm'
import StandardHeader from '@/components/ui/StandardHeader'


// function DeadlineBanner() {
//     return (
//         <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-xl shadow-sm animate-pulse-subtle">
//             <div className="flex items-center gap-3">
//                 <span className="text-2xl">⏳</span>
//                 <div>
//                     <h3 className="text-amber-800 font-black uppercase text-sm tracking-tight">Attenzione Scadenze</h3>
//                     <p className="text-amber-700 text-xs ,t-1">
//                         Puoi salvare i pronostici parzialmente e tornare dopo.
//                         <br />
//                         <strong>IMPORTANTE:</strong> Ogni partita verrà bloccata all'inizio del match (Gironi: dal 11/06).
//                     </p>
//                 </div>
//             </div>
//         </div>
//     )
// }

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
            
            
            {/* <header className="bg-emerald-600 text-white p-6 sticky top-0 z-10 shadow-md">
                <h1 className="text-2xl font-black uppercase text-center italic">Fase a Gironi ⚽</h1>
                <p className="text-center text-emerald-100 text-xs">Tutti i match del primo turno</p>
            </header> */}

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