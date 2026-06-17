'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveSideBets } from '@/app/actions/save-side-bets'

import ConfirmButton from '@/components/ui/ConfirmButton'
import StandardModal from '@/components/ui/StandardModal'

interface Bet {
    id: string
    label: string
    points_value: number
    type: 'team' | 'player' | 'score'
}

interface InitialAnswer {
    side_bet_id: string
    answer: string
    numeric_answer: number | null
}

interface SideBetsFormProps {
    bets: Bet[]
    teams: any[]
    initialAnswers: InitialAnswer[]
    isLocked: boolean
}

export default function SideBetsForm({ bets, teams, initialAnswers, isLocked = false }: SideBetsFormProps) {
    
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // trasformazione dati
    const formattedInitialData = initialAnswers.reduce((acc, curr) => {
        acc[curr.side_bet_id] = curr.answer || ''
        return acc
    }, {} as Record<string, string>)

    const formattedNumericData = initialAnswers.reduce((acc, curr) => {
        if (curr.numeric_answer !== null && curr.numeric_answer !== undefined) {
            acc[curr.side_bet_id] = curr.numeric_answer
        }
        return acc
    }, {} as Record<string, number | ''>)
    
    // stato inizializzato
    const [answers, setAnswers] = useState<Record<string, string>>(formattedInitialData)
    const [numericAnswers, setNumericAnswers] = useState<Record<string, number | ''>>(formattedNumericData)

    // identifichiamo gli ID per l'automazione (basandoci sulle label)
    const winnerBet = bets.find((b) => b.label.startsWith('Vincitore'))
    const finalScoreBet = bets.find((b) => b.type === 'score')
    const finalistBets = bets.filter((b) => b.label.startsWith('Finalista'))
    const semiBets = bets.filter((b: any) => b.label.startsWith('Semifinalista'))
    const topScorerBet = bets.find((b) => b.label.startsWith('Capocannoniere'))

    const handleTeamChange = (betId: string, teamName: string) => {
        if (isLocked) return
        setAnswers((prev) => ({
            ...prev,
            [betId]: teamName
        }))
    }

    const TeamSelect = ({ bet, isBig = false, forceTla = false }: { bet: any, isBig?: boolean, forceTla?: boolean }) => {
        const [isOpen, setIsOpen] = useState(false)
        const [searchTerm, setSearchTerm] = useState("")
        const selectedTeam = teams.find((t: any) => t.name === answers[bet.id])

        const filteredTeams = teams.filter((t: any) => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return (
            <div className="relative w-full">
                {/* Bottone che simula la Select */}
                <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                        setIsOpen(!isOpen)
                        setSearchTerm("")
                    }}
                    className={`w-full border-2 border-transparent rounded-2xl font-black text-slate-800 transition-all outline-none flex items-center justify-center relative
                        ${isOpen ? 'border-emerald-500 bg-white shadow-md' : ''} 
                        ${isLocked 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75' 
                            : 'bg-slate-50 hover:bg-slate-100'
                        } 
                        ${isBig 
                            ? 'py-5 px-10 text-lg sm:text-2xl' 
                            : 'py-4 px-10 text-xs sm:text-sm'
                        }`}
                >
                    <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 min-w-0 w-full px-1 sm:px-0">
                        {selectedTeam ? (
                            <>
                                <img 
                                    src={selectedTeam.flag} 
                                    alt="flag" 
                                    className={`object-cover rounded-[2px] shrink-0 shadow-xs ${isBig ? 'w-10 h-6' : 'w-5 h-3.5 sm:w-6 sm:h-4'}`}
                                />
                                
                                {/* CONTENITORE FLESSIBILE */}
                                <div className="min-w-0 truncate text-slate-800">
                                    
                                    {/* NOME INTERO */}
                                    <span className="hidden sm:inline font-bold truncate">
                                        {selectedTeam.name}
                                    </span>
                                    
                                    {/* TLA/NOME MOBILE */}
                                    <span className="sm:hidden font-black text-xs uppercase tracking-tighter truncate">
                                        {forceTla
                                            ? (selectedTeam.tla || selectedTeam.name.substring(0, 3))
                                            : selectedTeam.name
                                        }
                                    </span>
                                    
                                </div>
                            </>
                        ) : (
                            <span className="text-slate-400 font-medium tracking-tight truncate min-w-0">
                                {isBig ? 'Scegli il Campione' : 'Seleziona...'}
                            </span>
                        )}
                    </div>

                    {/* Freccetta */}
                    {!isLocked && (
                        <div className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 items-center pointer-events-none ${!isBig ? 'hidden sm:flex' : 'flex'}`}>
                            <svg className={`w-3 h-3 sm:w-5 sm:h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}
                    
                </button>

                {/* lista a tendina personalizzata con bandiere */}
                {isOpen && !isLocked && (
                    <>
                        {/* Overlay per chiudere il menu cliccando fuori */}
                        <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)}></div>

                        <div className="absolute z-30 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 overflow-hidden">
                            {/* campo di ricerca */}
                            <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Cerca squadra..."
                                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 shadow-sm text-slate-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* lista filtrata */}
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredTeams.length > 0 ? (
                                    filteredTeams.map((t: any) => (
                                        <button
                                            key={t.name}
                                            type="button"
                                            onClick={() => {
                                                handleTeamChange(bet.id, t.name)
                                                setIsOpen(false)
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            <img src={t.flag} alt={t.tla} className="w-6 h-4 object-cover rounded-sm shadow-xs" />
                                            <span className={`text-slate-700 ${answers[bet.id] === t.name ? 'font-black text-emerald-600' : 'font-bold'}`}>
                                                {t.name}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-slate-400 italic">
                                        Nessuna squadra trovata
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    const handleConfirmClick = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLocked) return
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (isLocked) return
        setIsModalOpen(false)
        setLoading(true)

        const result = await saveSideBets(answers, numericAnswers)

        if (result.success) {
            router.push('/')
            router.refresh()
        } else {
            alert("Errore salvataggio: " + result.error)
            setLoading(false)
        }
    }
    
    return (
        <form 
            onSubmit={handleConfirmClick}
            className="w-full max-w-2xl mx-auto px-4 mt-4 space-y-12 pb-24"
        >
            {/*  SEZIONE SEMIFINALI */}
            <section className="relative z-30">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-center text-slate-800">
                    🛡️ Le quattro semifinaliste?
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {semiBets.map((bet, idx) => (
                        <div key={bet.id} className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs min-w-0">
                            <span className={`text-[9px] font-black uppercase mb-1.5 sm:mb-2 block truncate ${isLocked ? 'text-slate-400' : 'text-emerald-600'}`}>
                                Semifinalista {idx + 1}
                            </span>
                            <TeamSelect bet={bet} forceTla={true} />
                        </div>
                    ))}
                </div>
            </section>

            {/* SEZIONE FINALE + RISULTATO ESATTO */}
            <section className="relative z-20 space-y-6">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-center text-slate-800">
                    ⚔️ La Finalissima
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-4 relative">
                    {finalistBets.map((bet, idx) => (
                        <div key={bet.id} className="flex-1 w-full bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xs">
                            <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block">
                                Finalista {idx + 1}
                            </span>
                            <TeamSelect bet={bet} />
                        </div>
                    ))}
                    <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:-translate-y-6 bg-slate-800 text-white w-10 h-10 rounded-full items-center justify-center font-black text-xs border-4 border-slate-50 z-30 shadow-md">
                        VS
                    </div>
                </div>

                {/* risultato esatto */}
                {finalScoreBet && (
                    <div className={`p-6 bg-white rounded-3xl border border-slate-100 shadow-xs text-center transition-all ${isLocked ? 'bg-slate-50' : ''}`}>
                        <p className={`text-[10px] font-black uppercase mb-4 tracking-widest ${isLocked ? 'text-slate-400' : 'text-emerald-600'}`}>
                            {finalScoreBet.label}
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            {/* input casa */}
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                disabled={isLocked}
                                value={(answers[finalScoreBet.id] || "0-0").split("-")[0]}
                                onChange={(e) => {
                                    if (isLocked) return
                                    const val = e.target.value.replace(/\D/g, "") || "0"
                                    const current = (answers[finalScoreBet.id] || "0-0").split("-")
                                    setAnswers(prev => ({ ...prev, [finalScoreBet.id]: `${val}-${current[1]}` }))
                                }}
                                className={`w-16 h-14 text-center font-black text-2xl rounded-2xl border-2 outline-none transition-all p-0 shadow-inner
                                    ${isLocked 
                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                                        : 'bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 text-slate-800'
                                    }`}
                            />

                            <span className={`text-2xl font-black ${isLocked ? 'text-slate-300' : 'text-emerald-400'}`}>-</span>

                            {/* input ospite */}
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                disabled={isLocked}
                                value={(answers[finalScoreBet.id] || "0-0").split("-")[1]}
                                onChange={(e) => {
                                    if (isLocked) return
                                    const val = e.target.value.replace(/\D/g, "") || "0"
                                    const current = (answers[finalScoreBet.id] || "0-0").split("-")
                                    setAnswers(prev => ({ ...prev, [finalScoreBet.id]: `${current[0]}-${val}` }))
                                }}
                                className={`w-16 h-14 text-center font-black text-2xl rounded-2xl border-2 outline-none transition-all p-0 shadow-inner
                                    ${isLocked 
                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                                        : 'bg-slate-50 border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 text-slate-800'
                                    }`}
                            />                                    
                        </div>
                    </div>
                )}
            </section>
            
            {/* SEZIONE VINCITORE */}
            <section className="text-center relative z-10">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-slate-800">
                    🏆 Chi Vince?
                </h2>

                {winnerBet && (
                    <div className={`p-8 rounded-[3rem] border-4 shadow-lg relative transition-all
                        ${isLocked 
                            ? 'from-slate-50 to-white bg-gradient-to-b border-slate-200' 
                            : 'from-amber-50 to-white bg-gradient-to-b border-amber-400 shadow-[0_20px_50px_rgba(251,191,36,0.2)]'
                        }`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none">✨</div>

                        {/* campo vincitore */}
                        <div>
                            <p className={`text-[10px] font-black uppercase mb-4 tracking-widest ${isLocked ? 'text-slate-400' : 'text-amber-600'}`}>
                                Chi alzerà la coppa?
                            </p>
                            <TeamSelect bet={winnerBet} isBig={true} />
                        </div>
                    </div>
                )}
            </section>

            {/* SEZIONE CAPOCANNONIERE */}
            <section className="relative z-0">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-center text-slate-800">
                    👟 Chi sarà il capocannoniere?
                </h2>
                {topScorerBet && (
                    <div className={`p-6 sm:p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden transition-colors ${isLocked ? 'bg-slate-200 border border-slate-300' : 'bg-slate-800'}`}>
                        <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 grayscale pointer-events-none">⚽</div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            {/* input nome giocatore */}
                            <input
                                type="text"
                                disabled={isLocked}
                                placeholder={isLocked ? "Nessun bomber inserito": "Nome e Cognome..."}
                                className={`flex-1 p-5 border-2 rounded-2xl font-bold transition-all text-center sm:text-left outline-none
                                    ${isLocked 
                                        ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' 
                                        : 'bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-emerald-400'
                                    }`}
                                value={answers[topScorerBet.id] || ''}
                                onChange={(e) => {
                                    if (isLocked) return
                                    setAnswers({...answers, [topScorerBet.id]: e.target.value})
                                }}
                            />

                            {/* input numero reti */}
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                <label className={`text-xs font-black uppercase tracking-widest ${isLocked ? 'text-slate-400' : 'text-white/70'}`}>
                                    Reti:
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    disabled={isLocked}
                                    placeholder="0"
                                    className={`w-24 p-5 border-2 rounded-2xl font-black text-xl transition-all text-center outline-none
                                        ${isLocked 
                                            ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' 
                                            : 'bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-emerald-400'
                                        }`}
                                    value={numericAnswers[topScorerBet.id] !== undefined ? numericAnswers[topScorerBet.id] : ''}
                                    onChange={(e) => {
                                        if (isLocked) return
                                        const val = e.target.value
                                        setNumericAnswers({...numericAnswers, [topScorerBet.id]: val === '' ? '' : parseInt(val, 10)})
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* TASTO SALVA */}
            {isLocked ? (
                // se è bloccato un banner pulito anziché il pulsante attivo
                <div className="w-full text-center py-4 bg-slate-100 rounded-2xl border border-dashed border-slate-200 text-xs font-black uppercase text-slate-400 flex items-center justify-center gap-2 tracking-wider">
                    🔒 Modifiche non consentite
                </div>
            ) : (
                <ConfirmButton
                    text="Salva Scommesse"
                    icon="💾"
                    type="submit"
                    loading={loading}
                    isFloating={false}
                />
            )}
            
            {/* POP-UP DI CONFERMA */}
            {isModalOpen && (
                <StandardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleSave}
                    loading={loading}
                    emoji="⭐"
                    title="Confermi le scelte?"
                    description={
                        <>I tuoi pronostici speciali verranno registrati. Potrai modificarli liberamente fino al fischio d'inizio ufficiale della fase a gironi.</>
                    }
                />
            )}
        </form>
    )
}