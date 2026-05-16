'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function RealtimeSettingsListener() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('live-settings')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'app_settings'},
                (payload) => {
                    console.log('Cambio di stato rilevato in Sala VAR! 📡', payload)
                    router.refresh()
                }
            )
            .subscribe()

        // quando l'utente cambia pagina, spegniamo l'antenna
        return() => {
            supabase.removeChannel(channel)
        }   
    }, [router, supabase])

    return null
}