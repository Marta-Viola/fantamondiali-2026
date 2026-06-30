'use client'

import { updateSystemStatus, triggerSideBetsCalculation } from '@/app/actions/admin-control'
import { syncMatches } from '@/app/actions/sync-matches'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminControlCenter({ currentSettings }: { currentSettings: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const phases = ['GIRONI', 'SEDICESIMI', 'OTTAVI', 'QUARTI', 'SEMIFINALI', 'FINALE']

    // Stati per la Zona Pericolo (Side Bets)
    const [unlockConfirm, setUnlockConfirm] = useState('')
    const [calculatingBets, setCalculatingBets] = useState(false)
    const [calculationResults, setCalculationResults] = useState<any[] | null>(null)

    // GESTIONE SYNC API MATCHES
    const handleSyncMatches = async () => {
        setIsSyncing(true)
        const res = await syncMatches()

        if (res.success) {
            alert(`Sincronizzazione completata! Aggiornate ${res.count} partite e ricalcolati i punti.`)
            router.refresh() // <--- MAGIA: Forza il ricaricamento dei dati client-side
        } else {
            alert("Errore API: " + res.error)
        }
        setIsSyncing(false)
    }

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

    const handleCalculateSideBets = async () => {
        if (unlockConfirm !== 'CONFERMO') return
        
        setCalculatingBets(true)
        
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
        <div className="space-y-8">
            
            {/* SEZIONE SYNC API (Spostata qui dal parent) */}
            <section className="bg-slate-900 p-6 rounded-[2.5rem] border-4 border-emerald-500/20 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📡</span>
                    <h3 className="text-emerald-500 text-sm font-black uppercase tracking-widest">Integrazione API & Punti</h3>
                </div>
                
                <button 
                    onClick={handleSyncMatches}
                    disabled={isSyncing}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        isSyncing 
                            ? 'bg-slate-800 text-emerald-500/50 cursor-not-allowed animate-pulse' 
                            : 'bg-emerald-50 text-emerald-900 hover:bg-white shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    }`}
                >
                    {isSyncing ? '🔄 Sincronizzazione in corso...' : '🔁 Sincronizza Partite & Punti'}
                </button>
                <p className="text-[10px] text-slate-500 mt-3 text-center italic">
                    Scarica i risultati e forza il ricalcolo immediato della classifica.
                </p>
            </section>

            {/* CENTRO DI COMANDO FASI */}
            <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl border-4 border-orange-500/20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="font-black uppercase italic tracking-tighter text-orange-500 text-xl">Centro di Comando</h2>
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
                            onClick={handleCalculateSideBets}
                            disabled={unlockConfirm !== 'CONFERMO' || calculatingBets}
                            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase transition-all duration-300 ${
                                unlockConfirm === 'CONFERMO'
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                        >
                            {calculatingBets ? 'Calcolo in corso...' : '💥 Esegui Calcolo'}
                        </button>
                    </div>

                    {/* TERMINALE DI LOG */}
                    {calculationResults && (
                        <div className="mt-6 bg-black/80 rounded-xl p-4 font-mono text-xs border border-emerald-500/30 shadow-inner">
                            <div className="text-emerald-500 mb-3 font-bold border-b border-emerald-900/50 pb-2">
                                ► TERMINALE VAR: Esito Calcolo Side Bets
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                                {calculationResults.length === 0 && (
                                    <div className="text-slate-500 italic">Nessun utente trovato o nessun punto da assegnare.</div>
                                )}
                                {calculationResults.map((res: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-emerald-900/10 px-2 py-1 rounded">
                                        <span className="text-emerald-400/80">
                                            <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                            UTENTE: <span className="text-white font-bold">{res.username}</span>
                                        </span>
                                        <span className={`font-black ${res.points > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                                            +{res.points} PT
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}