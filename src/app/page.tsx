// "/", la home

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { syncMatches } from './actions/sync-matches'

export default async function Home() {
  const supabase = await createClient()
  
  // chiedo a Supabase: "c'è un utente loggato?"
  const { data: { user } } = await supabase.auth.getUser()

  // se NON c'è un utente, lo spediamo alla pagina di login
  if (!user) {
    redirect('/login')
  }

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

  // se l'utente c'è, mostriamo la Dashboard (temporanea)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <h1 className="text-4xl font-bold mb-4 text-emerald-600">
        FantaMondiali Dashboard
      </h1>
      <p className="text-lg mb-8">
        Bentornato, <span className="font-mono font-bold">{user.email}</span>!
      </p>

      {/* TASTO ADMIN TEMPORANEO */}
      <form action={handleSync}>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition">
          Aggiorna Calendario Partite (API)
        </button>
      </form>

      <div className="mt-8 p-6 border rounded-xl shadow-sm bg-gray-50">
        <p>Questa sarà la tua Dashboard con la classifica e le partite.</p>
      </div>
    </main>
  )
}