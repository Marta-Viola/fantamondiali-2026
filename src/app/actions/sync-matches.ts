'use server'

import { createClient } from '@/utils/supabase/server'

export async function syncMatches() {
    const supabase = await createClient()
    const apiKey = process.env.FOOTBALL_DATA_API_KEY

    if (!apiKey) {
        throw new Error('API Key mancante nel file .env.local')
    }

    // 1. Chiamiamo l'API (WC = World Cup)
    const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 0 } // non vogliamo cache per questa operazione
    })

    const data = await response.json()

    if (!response.ok) {
        console.error('Errore API:', data)
        return { error: data.message || 'Errore nel recupero dati' }
    }

    const matches = data.matches

    // 2. Filtriamo e Prepariamo i dati per Supabase
    const formattedMatches = matches
        .filter((m: any) => m.homeTeam?.name && m.awayTeam?.name)   // SALTA le partite con nomi mancanti
        .map((m: any) => ({
            id: m.id,
            home_team: m.homeTeam.name,
            away_team: m.awayTeam.name,
            home_tla: m.homeTeam.tla,
            away_tla: m.awayTeam.tla,
            home_flag: m.homeTeam.crest || null,
            away_flag: m.awayTeam.crest || null,
            match_time: m.utcDate,
            stage: m.stage,
            status: m.status.toLowerCase(),
            home_score: m.score.fullTime.home ?? null,
            away_score: m.score.fullTime.away ?? null,
        }))

    if (formattedMatches.length === 0) {
        return { error: "Nessuna partita valida trovata con squadre definite." }
    }

    // 3. Salviamo su Supabase (Upsert: se esiste aggiorna, se no inseerisce)
    const { error } = await supabase
        .from('matches')
        .upsert(formattedMatches, { onConflict: 'id' })

    if (error) {
        console.error('Errore Supabase:', error)
        return { error: error.message }
    }

    return { success: true, count: formattedMatches.length }
}