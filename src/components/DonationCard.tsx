'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DonationCard() {
    const [copied, setCopied] = useState(false)
    const myNumber = "+393381904624"

    const handleSatispayClick = () => {
        // copia il numero negli appunti
        navigator.clipboard.writeText(myNumber)
        setCopied(true)
        
        // tenta di lanciare l'app satispay
        setTimeout(() => {
            window.location.href = "satispay://"
        }, 300)
        
        // ripristina il testo del bottone dopo 3 secondi
        setTimeout(() => setCopied(false), 3000)
    }

    return (
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl text-white border border-slate-700 my-6 max-w-2xl mx-auto">
            <div className="text-center mb-5">
                <span className="text-4xl block mb-2 animate-pulse">🍻</span>
                <h3 className="font-bold text-xl mb-1">Offrimi un gin lemon per lo sviluppo!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Mantenere i server, litigare con le API e scrivere codice di notte ha un costo (in occhiaie). Se l'app ti piace, supporta il progetto!
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                
                {/* BOTTONE SATISPAY (Copia + Apri App) */}
                <button 
                    onClick={handleSatispayClick}
                    className="flex items-center justify-center gap-3 bg-[#FF3366] hover:bg-[#E62E5C] text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md w-full sm:w-60"
                >
                    {/* Icona Portafoglio */}
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                    </svg>
                    {/* Contenitore a larghezza fissa per evitare il layout shift */}
                    <span className="w-36 text-left">
                        {copied ? "Numero copiato!" : "Usa Satispay"}
                    </span>
                </button>

                {/* BOTTONE PAYPAL (Link Diretto) */}
                <Link 
                    href="https://paypal.me/MartaViolaManzari" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-[#00457C] hover:bg-[#003366] text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md w-full sm:w-60"
                >
                    {/* Icona PayPal */}
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M7.076 21.337H5.07a.641.641 0 0 1-.633-.74L4.932 3.92a.641.641 0 0 1 .633-.544h5.689c3.085 0 5.21.65 6.34 1.942..." />
                    </svg>
                    <span className="w-36 text-left">
                        Paga con PayPal
                    </span>
                </Link>
            </div>
            
            <div className="text-center mt-4 space-y-1">
                <span className="text-xs text-slate-500 italic block">
                    Per Satispay: incolla il numero nella rubrica dell'app.
                </span>
                <span className="text-xs text-slate-500 italic block">
                    Per PayPal: scegli "Invia a un amico" per evitare le commissioni.
                </span>
            </div>
        </div>
    )
}