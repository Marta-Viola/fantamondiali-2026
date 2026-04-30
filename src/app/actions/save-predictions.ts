'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const GLOBAL_DEADLINE = new Date('2026-06-11T18:00:00Z')

export async function savePredictions(formData: { matchId: number, home: number, away: number }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Devi essere loggato")

    const now = new Date()

    if (now > GLOBAL_DEADLINE) {
        return { success: false, error: "Tempo scaduto! I pronostici per questa fase sono chiusi." }
    }

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
    return { success: true }
}