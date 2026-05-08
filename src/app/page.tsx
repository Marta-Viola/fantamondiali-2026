// "/", la home

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { syncMatches } from './actions/sync-matches'
import RankingWidget from '@/components/RankingWidget'

export default async function Home() {
  const supabase = await createClient()
  
  // chiedo a Supabase: "c'è un utente loggato?"
  const { data: { user } } = await supabase.auth.getUser()

  // se NON c'è un utente, lo spediamo alla pagina di login
  if (!user) {
    redirect('/login')
  }

  // recuperiamo il profilo per vedere il punteggio
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // funzione per il tasto action
  const handleSync = async () => {
    'use server'
    const result = await syncMatches()
    if (result.success) {
      console.log(`Sincronizzate ${result.count} partite!`)
    } else {
      console.error(result.error)
    }
  }

  const { data: rankings } = await supabase
    .from('profiles')
    .select('id, username, total_points, previous_rank')
    .order('total_points', { ascending: false })
    .limit(5)

  // se l'utente c'è, mostriamo la Dashboard (temporanea)
  return (
    <main className="min-h-screen bg-slate-50">
      {/* header dashboard */}
      <div className="bg-emerald-600 text-white p-8 rounded-b-[3rem] shadow-lg text-center">
        <h1 className="text-3xl font-black uppercase italic tracking tighter">FantaMondiali 2026</h1>
        <p className="opacity-90 mt-1 font-medium">Bentornato in campo, {profile?.username || user.email}</p>
      </div>
      
      <div className="max-w-md mx-auto p-6 -mt-8">
        {/* Card Punteggio */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 flex justify-between items-center mb-6">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Il tuo Punteggio</p>
            <p className="text-4xl font-black text-slate-800">{profile?.total_points || 0}</p>
          </div>
          <div className="text-5xl">🏆</div>
        </div>

        {/* pulsanti azione principale */}
        <div className="grid gap-4">
          {/* <Link href="/pronostici">
            <button className="w-full bg-white border-2 border-emerald-600 text-emerald-600 p-5 rounded-2xl font-black uppercase flex items-center justify-between hover:bg-emerald-50 transition-all shadow-sm">
              <span>⚽ Gestisci Pronostici</span>
              <span className="text-xl">→</span>
            </button>
          </Link>

          <Link href="/side-bets">
            <button className="w-full bg-white border-2 border-emerald-600 text-emerald-600 p-5 rounded-2xl font-black uppercase flex items-center justify-between hover:bg-emerald-50 transition-all shadow-sm">
              <span>⭐ Gestisci Scommesse Speciali</span>
              <span className="text-xl">→</span>
            </button>
          </Link> */}

          {/* widget classifica */}
          <RankingWidget users={rankings || []}/>

          {/* <button className="w-full bg-slate-200 text-slate-500 p-5 rounded-2xl font-black uppercase flex items-center justify-between cursor-not-allowed opacity-60">
            <span>📊 Classifica Generale</span>
            <span className="text-xs font-bold">Prossimamente</span>
          </button> */}
        </div>

        {/* Sezione Admin temporanea */}
        {profile?.role === 'admin' && (
          <div className="mt-12 p-4 border-2 border-dashed border-orange-200 rounded-2xl">
            <form action={handleSync}>
              <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition">
                Sincronizza Partite API
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}