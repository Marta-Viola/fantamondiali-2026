'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSideBets(
    answers: Record<string, string>,
    numericAnswers: Record<string, number | ''>
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Non autorizzato" }

    // 1. 🛡️ CONTROLLO LATO SERVER (Fondamentale!)
    // Mai fidarsi solo del frontend. Verifichiamo dal DB che il mercato sia DAVVERO aperto.
    const { data: settings } = await supabase
        .from('app_settings')
        .select('is_approved, voting_open_at, voting_closed_at')
        .single()

    if (!settings) return { success: false, error: "Impostazioni non trovate" }

    const now = new Date()
    const openAt = new Date(settings.voting_open_at)
    const closedAt = new Date(settings.voting_closed_at)

    // Se un hacker cerca di bypassare il form chiuso, il server lo respinge!
    if (!settings.is_approved || now < openAt || now > closedAt) {
        return { success: false, error: "Tempo scaduto o mercato chiuso dalla regia!" }
    }

    // 2. 🧹 PULIZIA DEI DATI
    // Filtriamo via le risposte vuote per evitare di salvare "spazzatura" nel DB
    const dataToUpsert = Object.entries(answers)
        .filter(([_, answer]) => answer && answer.trim() !== '') 
        .map(([betId, answer]) => {
            const numAnswer = numericAnswers[betId]
            
            return {
                user_id: user.id,
                side_bet_id: betId,
                answer: answer.trim(), // Togliamo spazi bianchi accidentali all'inizio o fine
                numeric_answer: (numAnswer !== undefined && numAnswer !== '') ? Number(numAnswer) : null
            }
        })

    // Se l'utente ha inviato un form completamente vuoto, usciamo senza dare errori
    if (dataToUpsert.length === 0) {
        return { success: true }
    }

    // 3. 💾 SALVATAGGIO INTELLIGENTE
    // Upsert aggiornerà le scommesse esistenti (stesso user_id + side_bet_id) 
    // e ne creerà di nuove per il Round 2 senza toccare quelle del Round 1!
    const { error } = await supabase
        .from('user_side_bets')
        .upsert(dataToUpsert, { 
            onConflict: 'user_id,side_bet_id' 
        })

    if (error) return { success: false, error: error.message }

    // 4. 🔄 AGGIORNAMENTO CACHE DELLE PAGINE
    revalidatePath('/side-bets')
    revalidatePath('/')
    
    return { success: true }
}