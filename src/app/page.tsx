// "/", la home

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { syncMatches } from './actions/sync-matches'
import RankingWidget from '@/components/RankingWidget'
import MatchWidget from '@/components/MatchWidget'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // fetch dati in parallelo
  const [profileRes, rankingRes, matchesRes, predictionRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').order('total_points', { ascending: false }).limit(5),
    supabase.from('matches').select('*').order('match_time', { ascending: true }),
    supabase.from('predictions').select('*').eq('user_id', user.id)
  ])

  const profile = profileRes.data
  const rankings = rankingRes.data
  const matches = matchesRes.data
  const predictions = predictionRes.data

  // // recuperiamo il profilo per vedere il punteggio
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single()

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

  // const { data: rankings } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .order('total_points', { ascending: false })
  //   .order('scores_count', { ascending: false })
  //   .order('gd_count', { ascending: false })
  //   .order('username', { ascending: true })
  //   .limit(5)

  // se l'utente c'è, mostriamo la Dashboard (temporanea)
  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* header dashboard */}
      <div className="bg-emerald-600 text-white pt-10 pb-16 px-6 rounded-b-[3.5rem] shadow-lg text-center">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">
          FantaMondiali 2026
        </h1>
        <p className="opacity-80 text-xs font-bold uppercase tracking-widest mt-1">
          Comando centrale
        </p>
        {/* <p className="opacity-80 text-xs font-bold uppercase tracking-widest mt-1">Bentornato in campo, {profile?.username || user.email}</p> */}
      </div>
      
      <div className="max-w-md mx-auto px-4 -mt-10 space-y-6">

        {/* Card Punteggio */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 flex justify-between items-center transform transition-transform hover:scale-[1.02]">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Il tuo Punteggio</p>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black text-slate-800">{profile?.total_points || 0}</p>
              <p className="text-slate-400 font-bold text-sm">PT</p>
            </div>
            <p className="text-emerald-600 text-xs font-bold mt-1">
              {profile?.username || 'Bomber'}
            </p>
            {/* <p className="text-4xl font-black text-slate-800"></p> */}
          </div>
          <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            🏆
          </div>
        </div>

        {/* widget partite */}
        <section className="space-y-3">
          <MatchWidget matches={matches} predictions={predictions} />
          <Link
            href="/pronostici"
            className="block w-full py-4 bg-emerald-600 text-white rounded-2xl text-center font-black uppercase text-xs shadow-md hover:bg-emerald-700 transition-all active:scale-95"
          >
            Inserisci Pronostici ⚽
          </Link>
        </section>

        {/* Widget classifica */}
        <section>
          {/* <div className="flex justify-between items-end mb-3 px-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Top 5 Globale</h3>
            <Link href="/classifica" className="text-xs font-bold text-emerald-600 hover:underline">Vedi tutta</Link>
          </div> */}
          <RankingWidget users={rankings || []} currentUserId={user.id} />
        </section>

        {/* Sezione Admin temporanea */}
        {profile?.role === 'admin' && (
          <div className="mt-12 p-6 bg-orange-50 border-2 border-dashed border-orange-200 rounded-3xl">
            <h4 className="text-orange-700 text-[10px] font-black uppercase mb-4 text-center tracking-widest">Area Riservata Capo</h4>
            <form action={handleSync}>
              <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 shadow-orange-200 shadow-lg transition-all active:scale-95">
                Forza Sincronizzazione API 🔂
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}