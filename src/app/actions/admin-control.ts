'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { PHASE_SCHEDULE } from '@/constants/phases'

export async function updateSystemStatus(action: 'DEFAULT' | 'BLOCK' | 'OPEN_NOW' | 'CLOSE_NOW', phase?: string) {
    const supabase = await createClient()
    const now = new Date().toISOString()

    let updateData: any = {}

    switch (action) {
        case 'BLOCK':
            updateData = { is_approved: false }
            break

        case 'OPEN_NOW':
            updateData = {
                current_phase: phase,
                voting_open_at: now,
                is_approved: true,
                voting_closed_at: new Date(Date.now() + 1000*60*60*24).toISOString()
            }
            break

        case 'CLOSE_NOW':
            updateData = {
                current_phase: phase,
                voting_closed_at: now,
                is_approved: true
            }
            break

        case 'DEFAULT':
            const config = (PHASE_SCHEDULE as any)[phase || 'GIRONI']
            updateData = {
                current_phase: phase,
                voting_open_at: config.defaultOpen,
                voting_closed_at: config.defaultClosed,
                is_approved: true
            }
            break
    }

    await supabase.from('app_settings').update(updateData).eq('id', 1)
    revalidatePath('/')
    revalidatePath('/pronostici')
    return { success: true }
}