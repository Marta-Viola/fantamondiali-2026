'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSideBets(answers: Record<string, string>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Non autorizzato")

    const dataToUpsert = Object.entries(answers).map(([betId, answer]) => ({
        user_id: user.id,
        side_bet_id: betId,
        answer: answer
    }))

    const { error } = await supabase
        .from('user_side_bets')
        .upsert(dataToUpsert, { 
            onConflict: 'user_id,side_bet_id'})

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true }
}