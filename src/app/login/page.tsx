'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(true)
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    
    // NUOVI STATI PER OTP (Codice a 8 cifre)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState('')
    
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const savedEmail = window.localStorage.getItem('fanta_email')
        if (savedEmail) {
            setEmail(savedEmail)
        }
    }, [])

    // STEP 1: Invia l'email per ricevere il codice
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        let finalUsername = username.trim()

        if (isRegistering && !showOtpInput) {
            if (finalUsername.length > 25) {
                setMessage('Errore: Il nickname è troppo lungo (max 25 caratteri)')
                setLoading(false)
                return
            }

            finalUsername = finalUsername
                .replace(/[^\w\s\-àèéìíòóùú]/gi, '')
                .replace(/\s+/g, ' ')
                .trim()

            if (finalUsername.length < 3) {
                setMessage('Errore: Il nickname deve avere almeno 3 caratteri validi')
                setLoading(false)
                return
            }

            let isUnique = false
            let counter = 0
            let candidateName = finalUsername

            try {
                while (!isUnique) {
                    const nameToTest = counter === 0 ? candidateName : `${candidateName}${counter}`
                    const { data: existingUser } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('username', nameToTest)
                        .maybeSingle()

                    if (!existingUser) {
                        finalUsername = nameToTest
                        isUnique = true
                    } else {
                        counter++
                        if (counter > 100) throw new Error("Troppi utenti con questo nome.")
                    }
                }
            } catch (err) {
                setMessage("Errore durante la verifica del nickname")
                setLoading(false)
                return
            }
        }

        const cleanEmail = email.trim().toLowerCase()

        // INVIO EMAIL OTP (Senza redirect URL)
        const { error } = await supabase.auth.signInWithOtp({
            email: cleanEmail,
            options: {
                data: isRegistering ? {
                    username: finalUsername,
                    full_name: fullName.trim(),
                } : {},
            },
        })

        window.localStorage.setItem('fanta_email', cleanEmail)

        if (error) {
            setMessage(`Errore: ${error.message}`)
        } else {
            setMessage('✅ Codice inviato! Controlla la tua email (e la cartella SPAM).')
            setShowOtpInput(true) // Passa alla schermata del codice
        }
        setLoading(false)
    }

    // STEP 2: Verifica il codice a 8 cifre e fai il login
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const cleanEmail = email.trim().toLowerCase()

        const { error } = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: otp,
            type: 'email'
        })

        if (error) {
            setMessage(`Errore codice: ${error.message}`)
            setLoading(false)
        } else {
            setMessage('✅ Accesso completato! Preparazione campo...')
            router.push('/') // Reindirizza l'utente alla home/dashboard
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 p-4 text-slate-900">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-emerald-600">
                
                {/* Nasconde il toggle Accedi/Registrati quando si inserisce il codice */}
                {!showOtpInput && (
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => { setIsRegistering(true); setMessage(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isRegistering ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
                        >
                            REGISTRATI
                        </button>
                        <button
                            onClick={() => { setIsRegistering(false); setMessage(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isRegistering ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
                        >
                            ACCEDI
                        </button>
                    </div>
                )}

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-emerald-700 uppercase tracking-tight">
                        FantaMondiali ⚽
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {showOtpInput 
                            ? 'Inserisci il codice di sicurezza' 
                            : (isRegistering ? 'Crea il tuo profilo bomber!' : 'Bentornato in campo!')}
                    </p>
                </div>
                
                {!showOtpInput ? (
                    // FORM 1: EMAIL E DATI
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isRegistering && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase ml-1">Nome e Cognome</label>
                                    <input
                                        type="text"
                                        placeholder="es. Beppe Manzari"
                                        className="p-4 border-2 border-slate-200 rounded-xl text-slate-900 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-slate-600 uppercase ml-1">Nickname (per la classifica)</label>
                                    <input
                                        type="text"
                                        placeholder="es. FalsoNueve66"
                                        className="p-4 border-2 border-slate-200 rounded-xl text-slate-900 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-600 uppercase ml-1">Email</label>
                            <input
                                type="email"
                                placeholder="es. bomber@esempio.it"
                                className="p-4 border-2 border-slate-200 rounded-xl text-slate-900 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 transition-all mt-2 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>{isRegistering ? 'Ricevi Codice di Accesso' : 'Invia Codice Segreto'}</>
                                )}
                        </button>
                    </form>
                ) : (
                    // FORM 2: INSERIMENTO CODICE OTP
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-50 text-slate-600 text-xs p-3 rounded-xl border border-slate-100 mb-2 text-center">
                            Abbiamo inviato un codice a 8 cifre a <br/><strong className="text-slate-800">{email}</strong>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={8}
                                placeholder="12345678"
                                // Stile per far sembrare l'input un vero codice PIN
                                className="p-4 border-2 border-slate-200 rounded-xl text-slate-900 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-300 text-center text-3xl font-black tracking-[0.5em]"
                                value={otp}
                                // Espressione regolare per forzare solo numeri
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 8}
                            className="bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-emerald-700 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 transition-all mt-2 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Entra in Sala VAR'
                            )}
                        </button>
                        
                        {/* Tasto per tornare indietro se si è sbagliata l'email */}
                        <button
                            type="button"
                            onClick={() => setShowOtpInput(false)}
                            className="text-xs text-slate-400 font-bold hover:text-slate-600 underline mt-2"
                        >
                            Non hai ricevuto il codice? Modifica email
                        </button>
                    </form>
                )}

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-center text-sm font-bold border ${
                        message.includes('Errore')
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                        {message}
                    </div>
                )}
            </div>

            <p className="mt-8 text-emerald-800/40 text-xs uppercase tracking-widest font-black">
                creato da smarta
            </p>
        </div>
    )
}