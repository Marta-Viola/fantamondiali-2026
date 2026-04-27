import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  // chiedo a Supabase: "c'è un utente loggato?"
  const { data: { user } } = await supabase.auth.getUser()

  // se NON c'è un utente, lo spediamo alla pagina di login
  if (!user) {
    redirect('/login')
  }

  // se l'utente c'è, mostriamo la Dashboard (temporanea)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-black">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">
        FantaMondiali 2026 🏆
      </h1>
      <p className="text-lg">
        Bentornato, <span className="font-mono font-bold">{user.email}</span>!
      </p>
      <div className="mt-8 p-6 border rounded-xl shadow-sm bg-gray-50">
        <p>Questa sarà la tua Dashboard con la classifica e le partite.</p>
      </div>
    </main>
  )
}