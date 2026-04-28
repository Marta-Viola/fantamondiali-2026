'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePredictions(formData: { matchId: number, home: number, away: number }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Devi essere loggato")

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