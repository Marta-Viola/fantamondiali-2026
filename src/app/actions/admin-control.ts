'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PHASE_SCHEDULE } from '@/constants/phases'

export async function updateSystemStatus(
    action: 'DEFAULT' | 'BLOCK' | 'OPEN_NOW' | 'CLOSE_NOW' | 'INITIAL_NOW', 
    phase?: string
) {
    const supabase = await createClient()
    const now = new Date()

    let updateData: any = {}

    if (phase) {
        updateData.current_phase = phase
    }

    const config = phase ? (PHASE_SCHEDULE as any)[phase] : null

    if (!config && action !== 'BLOCK') {
        return { success: false, error: "Specificare una fase valida per questa azione"}
    } 

    switch (action) {
        case 'BLOCK':
            updateData = { is_approved: false }
            break

        case 'INITIAL_NOW':
            updateData = {
                current_phase: phase,
                is_approved: true,
                voting_open_at: config.defaultOpen,
                voting_closed_at: config.defaultClosed
            }
            break

        case 'OPEN_NOW':
            const defaultClosedDate = new Date(config.defaultClosed)

            const openAtDate = new Date(now.getTime() - 60 * 60 * 1000)
            const closedAtDate = defaultClosedDate <= now
                ? new Date(now.getTime() + 60 * 60 * 1000)
                : defaultClosedDate

            updateData = {
                current_phase: phase,
                is_approved: true,
                voting_open_at: openAtDate.toISOString(),
                voting_closed_at: closedAtDate.toISOString()
            }
            break

        case 'CLOSE_NOW':
            const defaultOpenDate = new Date(config.defaultOpen)

            const forcedClosedAt = new Date(now.getTime() - 60 * 60 * 1000)
            const forcedOpenAt = defaultOpenDate >= now
                ? new Date(now.getTime() - 2 * 60 * 60 * 1000)
                : defaultOpenDate

            updateData = {
                current_phase: phase,
                voting_open_at: forcedOpenAt.toISOString(),
                voting_closed_at: forcedClosedAt.toISOString(),
                is_approved: true
            }
            break

        case 'DEFAULT':
            updateData = {
                current_phase: phase,
                voting_open_at: config.defaultOpen,
                voting_closed_at: config.defaultClosed,
                is_approved: true
            }
            break
    }

    console.log("DATI IN INVIO AL DB:", updateData)

    const {error} = await supabase
        .from('app_settings')
        .update(updateData)
        .eq('id', 1)
    
    if (error) {
        console.error("ERRORE DATABASE:", error.message)
        return { success: false, error: error.message }
    }
    
    revalidatePath('/')
    revalidatePath('/pronostici')
    revalidatePath('/admin')

    return { success: true }
}

export async function fetchSideBetsTruth() {
    const supabase = await createClient()
    
    // Peschiamo solo le scommesse a cui la regia ha assegnato un risultato
    const { data, error } = await supabase
        .from('side_bets')
        .select('label, result, numeric_result, round')
        .not('result', 'is', null)
        .order('round', { ascending: true })

    if (error) {
        console.error("Errore fetch verità:", error.message)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function triggerSideBetsCalculation() {
    const supabase = await createClient()
    
    try {
        // 1. IL LANCIO DEL MISSILE: Chiamiamo la mega-funzione SQL!
        const { error: rpcError } = await supabase.rpc('calculate_side_bets_points')
        
        if (rpcError) throw new Error(rpcError.message)

        // 2. IL REPORT: Andiamo a leggere i punti appena assegnati (solo chi ha fatto punti)
        const { data: logs, error: logsError } = await supabase
            .from('profiles')
            .select('username, side_bets_points')
            .gt('side_bets_points', 0) // Prendiamo solo chi ha > 0
            .order('side_bets_points', { ascending: false })

        if (logsError) throw new Error(logsError.message)

        const formattedLogs = logs.map(l => ({
            username: l.username,
            points: l.side_bets_points
        }))

        // Riavviamo la cache della classifica
        revalidatePath('/')
        revalidatePath('/classifica')
        
        return { success: true, data: formattedLogs }

    } catch (error: any) {
        console.error("ERRORE CALCOLO SIDE BETS:", error.message)
        return { success: false, error: error.message }
    }
}