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
}

interface SideBetsFormProps {
    bets: Bet[]
    teams: any[]
    initialAnswers: InitialAnswer[]
}

export default function SideBetsForm({ bets, teams, initialAnswers }: SideBetsFormProps) {
    // trasformazione dati
    const formattedInitialData = initialAnswers.reduce((acc, curr) => {
        acc[curr.side_bet_id] = curr.answer
        return acc
    }, {} as Record<string, string>)
    
    // stato inizializzato
    const [answers, setAnswers] = useState<Record<string, string>>(formattedInitialData)
    
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // identifichiamo gli ID per l'automazione (basandoci sulle label)
    const winnerBet = bets.find((b) => b.label.startsWith('Vincitore'))
    const finalScoreBet = bets.find((b) => b.type === 'score')
    const finalistBets = bets.filter((b) => b.label.startsWith('Finalista'))
    const semiBets = bets.filter((b: any) => b.label.startsWith('Semifinalista'))
    const topScorerBet = bets.find((b) => b.label.startsWith('Capocannoniere'))

    const getFlag = (teamName: string) => teams.find((t: any) => t.name === teamName)?.flag

    const handleTeamChange = (betId: string, teamName: string) => {
        setAnswers((prev) => ({
            ...prev,
            [betId]: teamName
        }))
        
        // let newAnswers = { ...answers, [betId]: teamName }

        // // AUTOMAZIONE
        // if (betId === winnerBet?.id) {
        //     // se cambio il vincitore, lo metto anceh come primo finalista e primo semifinalista
        //     if (finalistBets[0]) newAnswers[finalistBets[0].id] = teamName
        //     if (semiBets[0]) newAnswers[semiBets[0].id] = teamName
        // } else if (finalistBets.some((f: Bet) => f.id === betId)) {
        //     // se cambio un finalista, lo metto anche cmoe semifinalista corrispondente
        //     const index = finalistBets.findIndex((f: Bet) => f.id === betId)
        //     if (semiBets[index]) newAnswers[semiBets[index].id] = teamName
        // }

        // setAnswers(newAnswers)
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
                    onClick={() => {
                        setIsOpen(!isOpen)
                        setSearchTerm("")
                    }}
                    className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-800 transition-all outline-none flex items-center justify-center relative
                        ${isOpen ? 'border-emerald-500 bg-white shadow-md' : 'hover:bg-slate-100'} 
                        ${isBig ? 'p-5 text-2xl' : 'p-4 text-sm'}`}
                >
                    <div className="flex items-center gap-3 justify-center">
                        {selectedTeam ? (
                            <>
                                <img src={selectedTeam.flag} alt="flag" className={`object-cover rounded-sm shadow-sm ${isBig ? 'w-10 h-6' : 'w-6 h-4'}`} />
                                {/* nome intero sempre visibile su desktop */}
                                <span className="truncate hidden sm:block">{selectedTeam.name}</span>
                                {/* nome su mobile abbreviato solo se forceTla è vero, altrimenti intero */}
                                <span className="sm:hidden block uppercase tracking-tighter">
                                    {forceTla
                                        ? (selectedTeam.tla || selectedTeam.name.substring(0, 3))
                                        : selectedTeam.name
                                    }
                                </span>
                            </>
                        ) : (
                            <span className="text-slate-400 font-medium">{isBig ? 'Scegli il Campione' : 'Seleziona...'}</span>
                        )}
                    </div>
                    {/* Freccetta */}
                    <div className="absoulte right-4">
                        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {/* lista a tendina personalizzata con bandiere */}
                {isOpen && (
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

    const handleSave = async () => {
        setIsModalOpen(false)
        setLoading(true)

        const result = await saveSideBets(answers)

        if (result.success) {
            router.push('/')
            router.refresh()
        } else {
            alert("Errore salvataggio: " + result.error)
            setLoading(false)
        }
    }
    
    return (
        <div className="w-full max-w-2xl mx-auto px-4 mt-8 space-y-12">

            {/*  SEZIONE SEMIFINALI */}
            <section className="relative z-30">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-center text-slate-800">
                    🛡️ Le quattro semifinaliste?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {semiBets.map((bet, idx) => (
                        <div key={bet.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <span className="text-[9px] font-black text-emerald-600 uppercase mb-2 block">
                                Semifinalista {idx + 1}
                            </span>
                            <TeamSelect bet={bet} forceTla={true} />
                        </div>
                    ))}
                </div>
            </section>

            {/* SEZIONE FINALE */}
            <section className="relative z-20">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-center text-slate-800">
                    ⚔️ Chi va in finale?
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-4 relative">
                    {finalistBets.map((bet, idx) => (
                        <div key={bet.id} className="flex-1 w-full bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block">
                                Finalista {idx + 1}
                            </span>
                            <TeamSelect bet={bet} />
                        </div>
                    ))}
                    <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white w-10 h-10 rounded-full items-center justify-center font-black text-xs border-4 border-emerald-50 z-30 shadow-md">
                        VS
                    </div>
                </div>
            </section>
            
            {/* SEZIONE VINCITORE */}
            <section className="text-center relative z-10">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-slate-800">
                    🏆 Chi Vince?
                </h2>

                {winnerBet && (
                    <div className="bg-gradient-to-b from-amber-50 to-white p-8 rounded-[3rem] border-4 border-amber-400 shadow-[0_20px_50px_rgba(251,191,36,0.2)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none">✨</div>

                        {/* sezione vincitore */}
                        <div className="mb-8">
                            <p className="text-[10px] font-black uppercase text-amber-600 mb-4 tracking-widest">Chi alzerà la coppa?</p>
                            <TeamSelect bet={winnerBet} isBig={true} />
                        </div>

                        {/* risultato esatto */}
                        {finalScoreBet && (
                            <div className="pt-6 border-t-2 border-amber-200/50 relative z-10">
                                <p className="text-[10px] font-black uppercase text-amber-600 mb-4 tracking-widest">
                                    {finalScoreBet.label}
                                </p>

                                <div className="flex items-center justify-center gap-4">
                                    {/* input casa */}
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={(answers[finalScoreBet.id] || "0-0").split("-")[0]}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "") || "0"
                                            const current = (answers[finalScoreBet.id] || "0-0").split("-")
                                            setAnswers(prev => ({ ...prev, [finalScoreBet.id]: `${val}-${current[1]}` }))
                                        }}
                                        className="w-16 h-14 bg-white border-2 border-amber-200 rounded-2xl font-black text-2xl text-center text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all shadow-inner p-0"
                                    />

                                    <span className="text-2xl font-black text-amber-400">-</span>

                                    {/* input ospite */}
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={(answers[finalScoreBet.id] || "0-0").split("-")[1]}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "") || "0"
                                            const current = (answers[finalScoreBet.id] || "0-0").split("-")
                                            setAnswers(prev => ({ ...prev, [finalScoreBet.id]: `${current[0]}-${val}` }))
                                        }}
                                        className="w-16 h-14 bg-white border-2 border-amber-200 rounded-2xl font-black text-2xl text-center text-slate-800 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all shadow-inner p-0"
                                    />
                                    
                                    {/* <input
                                        type="text"
                                        placeholder="0 - 0"
                                        value={answers[finalScoreBet.id] || ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [finalScoreBet.id]: e.target.value }))}
                                        className="w-full bg-white border-2 border-amber-200 rounded-2xl px-4 py-3 font-black text-2xl text-center text-slate-800 placeholder:text-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition-all shadow-inner"
                                    /> */}
                                    
                                </div>
                            </div>
                        )}

                        
                    </div>
                )}
            </section>

            {/* SEZIONE CAPOCANNONIERE */}
            <section className="relative z-0">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-center text-slate-800">
                    👟 Chi sarà il capocannoniere?
                </h2>
                {topScorerBet && (
                    <div className="bg-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 grayscale pointer-events-none">⚽</div>
                        <input
                            type="text"
                            placeholder="Nome e Cognome del bomber..."
                            className="relative z-10 w-full p-5 bg-white/10 border-2 border-white/20 rounded-2xl font-bold text-white placeholder:text-white/30 outline-none focus:border-emerald-400 transition-all text-center"
                            value={answers[topScorerBet.id] || ''}
                            onChange={(e) => setAnswers({...answers, [topScorerBet.id]: e.target.value})}
                        />
                    </div>
                )}
            </section>

            {/* TASTO SALVA */}
            <ConfirmButton
                text="Salva Scommesse"
                icon="💾"
                onClick={() => setIsModalOpen(true)}
                loading={loading}
                isFloating={false}
            />

            {/* POP-UP DI CONFERMA */}
            {isModalOpen && (
                <StandardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleSave}
                    loading={loading}
                    emoji="⭐"
                    title="Quasi fatto!"
                    description={
                        <>Hai tempo fino al <span className="font-bold text-emerald-600">10 giugno</span> per modificare i tuoi pronostici speciali.</>
                    }
                />
            )}
        </div>
    )
}