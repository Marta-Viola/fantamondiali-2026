'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePredictions(formData: { matchId: number, home: number, away: number }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Devi essere loggato" }

    // 1. LEGGIAMO LE DATE DALLA SALA VAR (Addio data fissa dell'11 Giugno!)
    const { data: settings } = await supabase
        .from('app_settings')
        .select('is_approved, voting_open_at, voting_closed_at')
        .single()

    if (!settings) return { success: false, error: "Impostazioni non trovate" }

    const now = new Date()
    const openAt = new Date(settings.voting_open_at)
    const closedAt = new Date(settings.voting_closed_at)

    // Se la Sala VAR dice che è chiuso, blocchiamo
    if (!settings.is_approved || now < openAt || now > closedAt) {
        return { success: false, error: "Tempo scaduto! I pronostici per questa fase sono chiusi." }
    }

    // 2. SALVIAMO I DATI
    const predictions = formData.map(p => ({
        user_id: user.id,
        match_id: p.matchId,
        guess_home: p.home,
        guess_away: p.away
    }))

    const { error } = await supabase
        .from('predictions')
        .upsert(predictions, { onConflict: 'user_id, match_id' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/pronostici')
    revalidatePath('/')
    return { success: true }
}