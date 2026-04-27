import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // se tutto ok, mandalo alla home
            return NextResponse.redirect(`${origin}/`)
        }
    }

    // se c'è un errore, rimandalo al login
    return NextResponse.redirect(`${origin}/login`)
}