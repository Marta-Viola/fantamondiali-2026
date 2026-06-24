import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminControlCenter from '@/components/AdminControlCenter'
import { syncMatches } from '../actions/sync-matches'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const supabase = await createClient()

    // controllo sicurezza: solo admin allowed
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    // recupero impostazioni attuali
    const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .single()

    const handleSync = async () => {
        'use server'
        await syncMatches()
    }

    return (
        <main className="fixed inset-0 bg-slate-950 text-slate-100 overflow-y-auto selection:bg-orange-500/30">
            {/* header sala var */}
            <div className="bg-orange-600 p-8 rounded-b-[3rem] shadow-2xl text-center border-b-4 border-orange-800">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">SALA VAR 🖥️</h1>
                <p className="text-orange-100 text-xs font-bold uppercase tracking-[0.3em] mt-2">Accesso Riservato Direzione Gara</p>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-8 mt-4 pb-32">

                {/* sincronizzazione dati */}
                <section className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                    <h3 className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest">Integrazione API</h3>
                    <form action={handleSync}>
                        <button className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-sm hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2">
                            🔁 Sincronizza Partite & Risultati
                        </button>
                    </form>
                    <p className="text-[9px] text-slate-500 mt-3 text-center italic">
                        Usa questo per forzare l'aggiornamento dei punteggi reali e degli orari dei match.
                    </p>
                </section>

                {/* controllo fasi */}
                <AdminControlCenter currentSettings={settings} />
            </div>
        </main>
    )
}