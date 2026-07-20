import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminControlCenter from '@/components/AdminControlCenter'

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

    return (
        <main className="fixed inset-0 bg-slate-950 text-slate-100 overflow-y-auto selection:bg-orange-500/30">
            {/* header sala var */}
            <div className="bg-orange-600 p-8 rounded-b-[3rem] shadow-2xl text-center border-b-4 border-orange-800">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">SALA VAR 🖥️</h1>
                <p className="text-orange-100 text-xs font-bold uppercase tracking-[0.3em] mt-2">Accesso Riservato Direzione Gara</p>
            </div>

            <div className="max-w-md mx-auto p-6 mt-4 pb-32">
                {/* Il componente ora gestisce tutto lui, inclusa la sync API */}
                <AdminControlCenter currentSettings={settings} />
            </div>
        </main>
    )
}