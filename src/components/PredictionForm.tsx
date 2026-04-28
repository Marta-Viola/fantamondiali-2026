'use client'

import { useState, useRef } from 'react'
import { savePredictions } from '@/app/actions/save-predictions'

export default function PredictionForm({ matches, existingPredictions }: any) {
    const [loading, setLoading] = useState(false)

    // creiamo un riferimento per tutti gli input per gestire il "salto" del cursore
    const inputsRef = useRef<any[]>([])

    // organizziamo i dati iniziali
    const initialData = matches.reduce((acc: any, match: any) => {
        const prev = existingPredictions.find((p: any) => p.match_id === match.id)
        acc[match.id] = {
            home: prev ? prev.guess_home : '',
            away: prev ? prev.guess_away : ''
        }
        return acc
    }, {})

    const [values, setValues] = useState(initialData)

    const handleInputChange = (matchId: number, side: 'home' | 'away', val: string, index: number) => {
        // accetta solo numeri (max 2 cifre per sicurezza)
        if (val !== '' && !/^\d+$/.test(val)) return
        if (val.length > 2) return

        setValues({ ...values, [matchId]: { ...values[matchId], [side]: val } })

        // LOGICA DEL SALTO (focus management)
        // se l'utente ha inserito un numero, passa all'input successivo
        if (val !== '') {
            const nextInput = inputsRef.current[index + 1]
            if (nextInput) nextInput.focus()
        }
    }

    const onSave = async () => {
        setLoading(true)
        const toSave = Object.entries(values)
            .filter(([_, v]: any) => v.home !== '' && v.away !== '')
            .map(([id, v]: any) => ({ matchId: parseInt(id), home: parseInt(v.home), away: parseInt(v.away) }))

        const result = await savePredictions(toSave)
        setLoading(false)
        if (result.success) alert("✅ Pronostici salvati sul database!")
        else alert("❌ Errore durante il salvataggio: " + result.error)
    }

    return (
        <div className="space-y-3 pb-32">
            {matches.map((match: any, i: number) => (
                <div key={match.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-2 border border-emerald-100">

                    {/* Squadra casa */}
                    <div className="flex-1 flex items-center justify-end gap-3 text-right">
                        {/* Desktop: nome completo */}
                        <span className="text-xs font-bold uppercase text-slate-700 hidden sm:inline">{match.home_team}</span>
                        {/* Mobile: nome tagliato */}
                        <span className="text-sm font-black uppercase text-black sm:hidden">{match.home_team.substring(0,3)}</span>
                        <img src={match.home_flag} className="w-7 h-5 object-cover rounded shadow-sm border border-slate-100" alt="" />
                    </div>

                    {/* Input Score */}
                    <div className="flex items-center gap-1 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100">
                        <input
                            ref={(el) => (inputsRef.current[i * 2] = el)}
                            type="text"
                            inputMode="numeric"
                            className="w-11 h-11 text-center font-black text-xl rounded-lg border-2 border-transparent focus:border-emerald-500 focus:bg-white text-slate-900 bg-transaparent transition-all outline-none"
                            value={values[match.id].home}
                            onChange={(e) => handleInputChange(match.id, 'home', e.target.value, i * 2)}
                        />
                        <span className="text-emerald-300 font-black px-1">/</span>
                        <input
                            ref={(el) => (inputsRef.current[i * 2 + 1] = el)}
                            type="text"
                            inputMode="numeric"
                            className="w-11 h-11 text-center font-black text-xl rounded-lg border-2 border-transparent focus:border-emerald-500 focus:bg-white text-slate-900 bg-transaparent transition-all outline-none"
                            value={values[match.id].away}
                            onChange={(e) => handleInputChange(match.id, 'away', e.target.value, i * 2 + 1)}
                        />
                    </div>

                    {/* Squadra Trasferta */}
                    <div className="flex-1 flex items-center justify-start gap-3">
                        <img src={match.away_flag} className="w-7 h-5 object-cover rounded shadow-sm border border-slate-100" alt="" />
                        <span className="text-xs font-bold uppercase text-slate-700 hidden sm:inline">{match.away_team}</span>
                        <span className="text-sm font-black uppercase text-black sm:hidden">{match.away_team.substring(0,3)}</span>
                    </div>
                </div>
            ))}

            {/* Pulsante Salva Fluttuante */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none z-50">
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="pointer-events-auto w-full max-w-[280px] sm:max-w-md bg-emerald-600/95 backdrop-blur-sm text-white py-4 rounded-full font-black uppercase shadow-[0_15px_30px_rgba(5,150,105,0.4)] hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 disabled:bg-slate-400 transition-all flex items-center justify-center gap-3 border border-emerald-400/30 ring-white/10"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 w-full">
                            <span className="text-xl leading-none">💾</span>
                            <span className="leading-none tracking-tight">Conferma Pronostici</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    )
}