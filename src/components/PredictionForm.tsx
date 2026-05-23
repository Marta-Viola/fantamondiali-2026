'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { savePredictions } from '@/app/actions/save-predictions'

import ConfirmButton from '@/components/ui/ConfirmButton'
import StandardModal from '@/components/ui/StandardModal'

export default function PredictionForm({ matches, existingPredictions, isLocked = false }: any) {
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()

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
        // BLOCCO SICUREZZA: se è locked, non fare nulla
        if (isLocked) return
        
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

    const handleConfirmClick = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLocked) return
        setIsModalOpen(true)
    }

    const onFinalSave = async () => {
        setIsModalOpen(false)
        setLoading(true)

        const toSave = Object.entries(values)
            .filter(([_, v]: any) => v.home !== '' && v.away !== '')
            .map(([id, v]: any) => ({ matchId: parseInt(id), home: parseInt(v.home), away: parseInt(v.away) }))

        const result = await savePredictions(toSave)

        if (result.success) {
            router.push('/')
            router.refresh()
        } else {
            setLoading(false)
            alert("❌ Errore durante il salvataggio: " + result.error)
        }
    }

    // calcoliamo quante partite sono state compilate
    const completedCount = Object.values(values).filter((v: any) => v.home !== '' && v.away !== '').length;
    const totalCount = matches.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return (
        <form 
            onSubmit={handleConfirmClick}
            className="group w-full max-w-2xl mx-auto px-2 sm:px-4 mt-2 sm:mt-4 space-y-8 pb-32"
        >
            {/* Progress Bar */}
            <div className={`${isLocked ? 'relative' : 'sticky top-[72px] sm:top-[88px]'} z-[50] w-full max-w-2xl mx-auto mb-4 transition-all`}>
                <div className={`bg-white/95 backdrop-blur-md border p-4 rounded-3xl shadow-md ${isLocked ? 'border-slate-200 bg-slate-50/90' : 'border-emerald-100'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${isLocked ? 'bg-slate-400' : 'bg-emerald-600'}`}>
                                {isLocked ? 'CHIUSO' : 'LIVE'}
                            </span>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                {isLocked ? 'Riepilogo Scelte' : 'Stato Pronostici'}
                            </span>
                        </div>
                        
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${isLocked ? 'text-slate-500 bg-slate-100 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-100'}`}>
                            {completedCount} <span className="text-slate-400 mx-1">/</span> {totalCount}
                        </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${isLocked ? 'bg-slate-300' : 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Lista match */}
            <div className="space-y-3 max-w-2xl mx-auto">
                {matches.map((match: any, i: number) => (
                    <div key={match.id} className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm flex items-center justify-between gap-1 sm:gap-2 border border-slate-100 hover:border-emerald-100 transition-colors">

                        {/* Squadra casa */}
                        <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 text-right min-w-0">
                            {/* Desktop: nome completo */}
                            <span className="text-xs font-black uppercase text-slate-700 hidden sm:inline truncate">
                                {match.home_team}
                            </span>
                            {/* Mobile: TLA */}
                            <span className="text-[11px] sm:text-sm font-black uppercase text-slate-800 sm:hidden shrink-0">
                                {match.home_tla || match.home_team.substring(0,3)}
                            </span>
                            <img src={match.home_flag} className="w-6 h-4 sm:w-7 sm:h-5 object-cover rounded shadow-xs border border-slate-100 shrink-0" alt="" />
                        </div>

                        {/* Input Score */}
                        <div className={`flex items-center gap-0.5 sm:gap-1 p-1 rounded-xl border shrink-0 transition-colors ${isLocked ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50/50 border-emerald-100/80'}`}>
                            <input
                                ref={(el) => { inputsRef.current[i * 2] = el }}
                                type="text"
                                inputMode="numeric"
                                disabled={isLocked}
                                className={`w-9 h-9 sm:w-11 sm:h-11 text-center font-black text-lg sm:text-xl rounded-lg border-2 border-transparent transition-all outline-none ${isLocked ? 'text-slate-400 bg-transparent cursor-not-allowed' : 'focus:border-emerald-500 focus:bg-white text-slate-900 bg-transparent'}`}
                                value={values[match.id]?.home ?? ''}
                                onChange={(e) => handleInputChange(match.id, 'home', e.target.value, i * 2)}
                            />
                            <span className={`font-black px-0.5 ${isLocked ? 'text-slate-300' : 'text-emerald-300'}`}>-</span>
                            <input
                                ref={(el) => { inputsRef.current[i * 2 + 1] = el }}
                                type="text"
                                inputMode="numeric"
                                disabled={isLocked}
                                className={`w-9 h-9 sm:w-11 sm:h-11 text-center font-black text-lg sm:text-xl rounded-lg border-2 border-transparent transition-all outline-none ${isLocked ? 'text-slate-400 bg-transparent cursor-not-allowed' : 'focus:border-emerald-500 focus:bg-white text-slate-900 bg-transparent'}`}
                                value={values[match.id]?.away ?? ''}
                                onChange={(e) => handleInputChange(match.id, 'away', e.target.value, i * 2 + 1)}
                            />
                        </div>

                        {/* Squadra Trasferta */}
                        <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-3 min-w-0">
                            <img src={match.away_flag} className="w-6 h-4 sm:w-7 sm:h-5 object-cover rounded shadow-xs border border-slate-100 shrink-0" alt="" />
                            <span className="text-xs font-black uppercase text-slate-700 hidden sm:inline truncate">
                                {match.away_team}
                            </span>
                            <span className="text-[11px] sm:text-sm font-black uppercase text-black sm:hidden shrink-0">
                                {match.away_tla || match.away_team.substring(0,3)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Pulsante Salva Fluttuante */}
            <div className="transition-all duration-300 opacity-100 translate-y-0 group-focus-within:opacity-0 group-focus-within:translate-y-10 group-focus-within:pointer-events-none">
                {isLocked ? (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <span className="text-base">🔒</span>
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Scommesse</span>
                            <span className="text-xs font-black uppercase italic tracking-tight text-slate-200">Fase Chiusa</span>
                        </div>
                    </div>
                ) : (
                    <ConfirmButton
                        text="Salva Scommesse"
                        icon="💾"
                        type="submit"
                        loading={loading}
                        isFloating={true}
                    />
                )}
            </div>
            
            {/* POP-UP */}
            {isModalOpen && (
                <StandardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={onFinalSave}
                    loading={loading}
                    emoji="⚽"
                    title="Confermi le scelte?"
                    description={
                        <>I tuoi pronostici verranno registrati. Potrai modificarli liberamente fino alla chiusura ufficiale del mercato di questa fase.</>
                    }
                />
            )}
        </form>
    )
}