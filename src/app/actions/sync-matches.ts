'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const statusMapper: Record<string, string> = {
    'timed': 'scheduled',
    'scheduled': 'scheduled',
    'live': 'live',
    'in_play': 'live',
    'finished': 'finished',
    'postponed': 'postponed'
}

export async function syncMatches() {
    const supabase = await createClient()
    const apiKey = process.env.FOOTBALL_DATA_API_KEY

    if (!apiKey) {
        throw new Error('API Key mancante nel file .env.local')
    }

    // 1. Chiamiamo l'API (WC = World Cup)
    try {
        const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
            headers: { 'X-Auth-Token': apiKey },
            next: { revalidate: 0 } // non vogliamo cache per questa operazione
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Errore API:', data)
            return { success: false, error: data.message || 'Errore nel recupero dati API' }
        }

        const matches = data.matches

        // 🛡️ FIX SICUREZZA: Controlliamo che la risposta dell'API contenga effettivamente l'array matches
        if (!matches || !Array.isArray(matches)) {
            return { success: false, error: 'Formato dati API non valido' }
        }

        // 2. Filtriamo e Prepariamo i dati per Supabase
        const formattedMatches = matches
            .filter((m: any) => m.homeTeam?.name && m.awayTeam?.name)   // SALTA le partite con nomi mancanti
            .map((m: any) => {
                const apiStatus = m.status?.toLowerCase() || ''
                const normalizedStatus = statusMapper[apiStatus] || apiStatus

                // 🎯 FIX RISULTATO: Prendiamo il regularTime (prima dei rigori/supplementari).
                // Mettiamo in cascata (??) un fallback sul fullTime nel caso l'API, per partite non ancora iniziate, 
                // non esponga proprio l'oggetto regularTime.
                const homeGoals = m.score?.regularTime?.home ?? m.score?.fullTime?.home ?? null
                const awayGoals = m.score?.regularTime?.away ?? m.score?.fullTime?.away ?? null

                return {
                    id: m.id,
                    home_team: m.homeTeam.name,
                    away_team: m.awayTeam.name,
                    home_tla: m.homeTeam.tla || null,
                    away_tla: m.awayTeam.tla || null,
                    home_flag: m.homeTeam.crest || null,
                    away_flag: m.awayTeam.crest || null,
                    match_time: m.utcDate,
                    stage: m.stage,
                    status: normalizedStatus,
                    home_score: homeGoals,
                    away_score: awayGoals,
                }
            })

        if (formattedMatches.length === 0) {
            return { success: false, error: "Nessuna partita valida trovata." }
        }

        // 3. Salviamo su Supabase (Upsert: se esiste aggiorna, se no inserisce)
        const { error: matchError } = await supabase
            .from('matches')
            .upsert(formattedMatches, { onConflict: 'id' })

        if (matchError) {
            console.error('Errore Supabase Match:', matchError)
            return { success: false, error: matchError.message }
        }

        // aggiorna la data dell'ultima sincro
        const { error: settingsError } = await supabase
            .from('app_settings')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', 1)

        if (settingsError) {
            console.error('Errore Supabase Settings:', settingsError)
        }

        const { error: rpcError } = await supabase.rpc('update_user_points')

        if (rpcError) {
            console.error('Errore durante il calcolo dei punti:', rpcError)
            return { success: false, error: 'Partite aggiornate ma calcolo punti fallito'}
        }

        // REVALIDATION
        revalidatePath('/')
        revalidatePath('/classifica')
        revalidatePath('/pronostici')
        revalidatePath('/partite')

        return { success: true, count: formattedMatches.length }
    } catch (err: any) {
        console.error('Errore durante la sync:', err)
        return { success: false, error: err.message }
    }
}