'use client'

import { updateSystemStatus, triggerSideBetsCalculation, fetchSideBetsTruth } from '@/app/actions/admin-control'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminControlCenter({ currentSettings }: { currentSettings: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const phases = ['GIRONI', 'SEDICESIMI', 'OTTAVI', 'QUARTI', 'SEMIFINALI', 'FINALE']

    // Stati per la Zona Pericolo (Side Bets)
    const [unlockConfirm, setUnlockConfirm] = useState('')
    const [calculatingBets, setCalculatingBets] = useState(false)
    const [calculationResults, setCalculationResults] = useState<any[] | null>(null)
    
    // Stati per il PRE-FLIGHT CHECK
    const [showTruthModal, setShowTruthModal] = useState(false)
    const [truthData, setTruthData] = useState<any[]>([])
    const [fetchingTruth, setFetchingTruth] = useState(false)

    const handleAction = async (action: any, phase?: string) => {
        setLoading(true)
        const res = await updateSystemStatus(action, phase)

        if (res.success) {
            router.refresh()
        } else {
            alert(("Errore: " + res.error))
        }
        setLoading(false)
    }

    // Step 1: L'admin preme "Esegui Calcolo", facciamo il Pre-Flight Check
    const handlePreFlightCheck = async () => {
        if (unlockConfirm !== 'CONFERMO') return
        
        setFetchingTruth(true)
        const res = await fetchSideBetsTruth()
        
        if (res.success) {
            setTruthData(res.data || [])
            setShowTruthModal(true)
        } else {
            alert("Impossibile recuperare i risultati: " + res.error)
        }
        setFetchingTruth(false)
    }

    // Step 2: L'admin ha controllato i dati e dà il via libera definitivo
    const handleFinalCalculation = async () => {
        setShowTruthModal(false)
        setCalculatingBets(true)
        
        // Chiamata alla server action che esegue la funzione SQL
        const res = await triggerSideBetsCalculation()
        
        if (res.success) {
            setCalculationResults(res.data || null)
            setUnlockConfirm('') 
            router.refresh()
        } else {
            alert("Errore nel calcolo: " + res.error)
        }
        setCalculatingBets(false)
    }

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl border-4 border-orange-500/20 relative">
            
            {/* --- MODALE PRE-FLIGHT CHECK --- */}
            {showTruthModal && (
                <div className="absolute inset-0 z-50 bg-slate-950/95 rounded-[2rem] p-6 flex flex-col backdrop-blur-sm border-2 border-red-500">
                    <h3 className="text-red-500 font-black uppercase text-2xl tracking-tighter mb-2 flex items-center gap-2">
                        <span>🚨</span> PRE-FLIGHT CHECK
                    </h3>
                    <p className="text-slate-300 text-xs mb-4">
                        Questi sono i risultati ufficiali letti dal database. La funzione li userà come **Verità Assoluta** per assegnare i punti. Verifica che siano corretti:
                    </p>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/50 rounded-xl p-4 mb-4 border border-slate-800 space-y-3">
                        {truthData.length === 0 ? (
                            <div className="text-amber-500 font-bold text-center text-sm">
                                ⚠️ ATTENZIONE: Non hai ancora inserito nessun risultato nella tabella side_bets! I punti saranno tutti a zero.
                            </div>
                        ) : (
                            truthData.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <div>
                                        <div className="text-[10px] text-slate-500 font-black uppercase">Round {t.round} • {t.label}</div>
                                        <div className="text-white font-bold">{t.result} {t.numeric_result ? `(${t.numeric_result} gol)` : ''}</div>
                                    </div>
                                    <div className="text-emerald-500 text-xl">✅</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowTruthModal(false)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold uppercase text-xs transition-colors"
                        >
                            Annulla e Correggi
                        </button>
                        <button 
                            onClick={handleFinalCalculation}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black uppercase text-xs shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all animate-pulse"
                        >
                            CONFERMA E CALCOLA 💥
                        </button>
                    </div>
                </div>
            )}
            {/* --- FINE MODALE --- */}


            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-black uppercase italic tracking-tighter text-orange-500 text-xl">Centro di Comando Admin</h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                        Stato: {currentSettings.is_approved ? '✅ Attivo' : '🛑 Bloccato'} | Fase: {currentSettings.current_phase}
                    </p>
                </div>

                <button
                    onClick={() => handleAction('BLOCK')}
                    disabled={!currentSettings.is_approved}
                    className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${
                        currentSettings.is_approved ? 'bg-rose-600 animate-pulse' : 'bg-slate-700 opacity-50'
                    }`}
                >
                    🛑 Fermi Tutti
                </button>
            </div>

            <div className="space-y-4">
                {phases.map(phase => {
                    const isCurrentPhase = currentSettings.current_phase === phase

                    return (
                        <div key={phase} className={`p-4 rounded-2xl border transition-all ${
                                isCurrentPhase ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100'
                            }`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className={`font-bold text-sm ${isCurrentPhase ? 'text-orange-400' : 'text-slate-400'}`}>
                                    {phase} {isCurrentPhase && '📍'}
                                </span>
                                <button
                                    onClick={() => handleAction('DEFAULT', phase)}
                                    className="text-[10px] font-black uppercase text-orange-400 hover:underline"
                                >
                                    Reset Default
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleAction('INITIAL_NOW', phase)}
                                    className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white py-2 rounded-lg font-bold text-[10px] transition-all"
                                >
                                    INITIAL
                                </button>
                                <button
                                    onClick={() => handleAction('OPEN_NOW', phase)}
                                    className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white py-2 rounded-lg font-bold text-xs transition-all"
                                >
                                    APRI FASE
                                </button>
                                <button
                                    onClick={() => handleAction('CLOSE_NOW', phase)}
                                    className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white py-2 rounded-lg font-bold text-xs transition-all"
                                >
                                    CHIUDI FASE
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {loading && (
                <div className="mt-4 text-center text-[10px] font-bold animate-bounce text-orange-500 uppercase tracking-widest">
                    TRASMISSIONE COMANDO IN CORSO...
                </div>
            )}

            {/* ⚠️ ZONA PERICOLO - SIDE BETS */}
            <div className="mt-8 p-6 border-4 border-red-900/50 rounded-3xl bg-red-950/20">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <h3 className="text-red-500 font-black uppercase text-xl tracking-tighter">Zona Pericolo: Side Bets</h3>
                </div>
                <p className="text-red-300/70 text-xs mb-6 font-medium">
                    Questa azione calcolerà i punti per tutti gli utenti in base ai risultati attuali delle side bets. 
                    Scrivi <strong className="text-red-400">CONFERMO</strong> per sbloccare il missile.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input
                        type="text"
                        value={unlockConfirm}
                        onChange={(e) => setUnlockConfirm(e.target.value)}
                        placeholder="Scrivi CONFERMO..."
                        className="bg-black/50 border-2 border-red-900/50 rounded-xl px-4 py-3 text-red-500 font-black uppercase w-full sm:w-56 focus:outline-none focus:border-red-500 transition-colors placeholder:text-red-900/50 text-sm tracking-widest"
                    />
                    <button
                        onClick={handlePreFlightCheck}
                        disabled={unlockConfirm !== 'CONFERMO' || fetchingTruth || calculatingBets}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase transition-all duration-300 ${
                            unlockConfirm === 'CONFERMO'
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                        {fetchingTruth ? 'Verifica Dati...' : calculatingBets ? 'Calcolo...' : '💥 Esegui Calcolo'}
                    </button>
                </div>

                {/* TERMINALE DI LOG */}
                {calculationResults && (
                    <div className="mt-6 bg-black/80 rounded-xl p-4 font-mono text-xs border border-emerald-500/30 shadow-inner">
                        <div className="text-emerald-500 mb-3 font-bold border-b border-emerald-900/50 pb-2 flex justify-between">
                            <span>► TERMINALE VAR: Esito Calcolo Side Bets</span>
                            <span>{calculationResults.length} UTENTI A PUNTI</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                            {calculationResults.length === 0 && (
                                <div className="text-slate-500 italic">Nessun utente ha totalizzato punti speciali.</div>
                            )}
                            {calculationResults.map((res: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-emerald-900/10 px-2 py-1 rounded">
                                    <span className="text-emerald-400/80 truncate pr-2">
                                        <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                        UTENTE: <span className="text-white font-bold">{res.username}</span>
                                    </span>
                                    <span className={`font-black shrink-0 ${res.points > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                                        +{res.points} PT
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}