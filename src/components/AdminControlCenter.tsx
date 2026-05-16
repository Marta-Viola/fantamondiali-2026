'use client'

import { updateSystemStatus } from '@/app/actions/admin-control'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminControlCenter({ currentSettings }: { currentSettings: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const phases = ['GIRONI', 'SEDICESIMI', 'OTTAVI', 'QUARTI', 'SEMIFINALI', 'FINALE']

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

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl border-4 border-orange-500/20">
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
        </div>
    )
}