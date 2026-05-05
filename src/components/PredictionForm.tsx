'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { savePredictions } from '@/app/actions/save-predictions'

import ConfirmButton from '@/components/ui/ConfirmButton'
import StandardModal from '@/components/ui/StandardModal'

export default function PredictionForm({ matches, existingPredictions }: any) {
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
        <div className="pb-32">
            {/* Progress Bar */}
            <div className="sticky top-[72px] z-30 w-full max-w-2xl mx-auto px-4 mb-4">
                <div className="bg-white/80 backdrop-blur-md border border-emerald-100 p-4 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                LIVE
                            </span>
                            <span className="text-[11px] font-black uppercase text-slate-700 tracking-widest">
                                Stato Pronostici
                            </span>
                        </div>
                        
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            {completedCount} <span className="text-slate-400 mx-1">/</span> {totalCount}
                        </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
                
            </div>

            {/* Lista match */}
            <div className="space-y-3 px-4 max-2-2xl mx-auto">
                {matches.map((match: any, i: number) => (
                    <div key={match.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-2 border border-emerald-100">

                        {/* Squadra casa */}
                        <div className="flex-1 flex items-center justify-end gap-3 text-right">
                            {/* Desktop: nome completo */}
                            <span className="text-xs font-bold uppercase text-slate-700 hidden sm:inline">{match.home_team}</span>
                            {/* Mobile: nome tagliato */}
                            <span className="text-sm font-black uppercase text-black sm:hidden">
                                {match.home_tla || match.home_team.substring(0,3)}
                            </span>
                            <img src={match.home_flag} className="w-7 h-5 object-cover rounded shadow-sm border border-slate-100" alt="" />
                        </div>

                        {/* Input Score */}
                        <div className="flex items-center gap-1 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100">
                            <input
                                ref={(el) => {(inputsRef.current[i * 2] = el)}}
                                type="text"
                                inputMode="numeric"
                                className="w-11 h-11 text-center font-black text-xl rounded-lg border-2 border-transparent focus:border-emerald-500 focus:bg-white text-slate-900 bg-transaparent transition-all outline-none"
                                value={values[match.id].home}
                                onChange={(e) => handleInputChange(match.id, 'home', e.target.value, i * 2)}
                            />
                            <span className="text-emerald-300 font-black px-1">/</span>
                            <input
                                ref={(el) => {(inputsRef.current[i * 2 + 1] = el)}}
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
                            <span className="text-sm font-black uppercase text-black sm:hidden">
                                {match.away_tla || match.away_team.substring(0,3)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Pulsante Salva Fluttuante */}
            <ConfirmButton
                text="Salva Scommesse"
                icon="💾"
                onClick={() => setIsModalOpen(true)}
                loading={loading}
                isFloating={true}
            />
            
            {/* <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none z-50">
                <button
                    onClick={handleConfirmClick}
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
            </div> */}
            
            {/* POP-UP */}
            {isModalOpen && (
                <StandardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={onFinalSave}
                    loading={loading}
                    emoji="⚽"
                    title="Quasi fatto!"
                    description={
                        <>Hai tempo fino al <span className="font-bold text-emerald-600">10 giugno</span> per modificare i tuoi pronostici.</>
                    }
                />

                // <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                //     {/* sfondo oscurato */}
                //     <div
                //         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                //         onClick={() => setIsModalOpen(false)}
                //     ></div>

                //     {/* Contenuto modale */}
                //     <div className="relative bg-white w-full max-w-dm rounded-3xl shadow-wxl overflow-hidden animate-in fade-in zoom-in duration-200">
                //         {/* bottone x in alto a destra */}
                //         <button
                //             onClick={() => setIsModalOpen(false)}
                //             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
                //         >
                //             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                //             </svg>
                //         </button>

                //         <div className="p-8 pt-10 text-center">
                //             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                //                 ⚽
                //             </div>
                //             <h3 className="text-xl font-black text-slate-800 uppercase mb-2">
                //                 Quasi fatto!
                //             </h3>
                //             <p className="text-slate-500 text-sm leading-relaxed mb-6">
                //                 I tuoi pronostici verranno salvati ora. Potrai modificarli tutte le volte che vuoi fino al <span className="font-bold text-emerald-600 underline">11 Giugno alle 18:00</span>.
                //             </p>

                //             <button
                //                 onClick={onFinalSave}
                //                 className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"       
                //             >
                //                 Ho Capito, Salva!
                //             </button>

                //         </div>
                //     </div>
                // </div>
            )}
        </div>
    )
}