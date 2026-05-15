'use client'

import { updateSystemStatus } from '@/app/actions/admin-control'
import { useState } from 'react'

export default function AdminControlCenter({ currentSettings }: any) {
    const [loading, setLoading] = useState(false)
    const phases = ['GIRONI', 'SEDICESIMI', 'OTTAVI', 'QUARTI', 'SEMIFINALI', 'FINALE']

    const handleAction = async (action: any, phase?: string) => {
        setLoading(true)
        await updateSystemStatus(action, phase)
        setLoading(false)
    }

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl border-4 border-orange-500/20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-black uppercase italic tracking-tighter text-orange-500">Centro di Comando Admin</h2>
                <button
                    onClick={() => handleAction('BLOCK')}
                    className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl font-black text-xs uppercase animate-pulse"
                >
                    🛑 Fermi Tutti (Blocca)
                </button>
            </div>

            <div className="space-y-4">
                {phases.map(phase => (
                    <div key={phase} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm text-slate-400">{phase}</span>
                            <button
                                onClick={() => handleAction('DEFAULT', phase)}
                                className="text-[10px] font-black uppercase text-orange-400 hover:underline"
                            >
                                Reset Default
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
                ))}
            </div>

            {loading && <div className="mt-4 text-center text-[10px] font-bold animate-bounce text-orange-500">TRASMISSIONE COMANDO...</div>}
        </div>
    )
}