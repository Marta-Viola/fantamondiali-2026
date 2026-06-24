'use client'

import { useState } from 'react'

interface Match {
    id: number;
    match_time: string;
    stage: string;
    home_team: string;
    away_team: string;
    home_flag: string;
    away_flag: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
}

interface Prediction {
    match_id: number;
    guess_home: number;
    guess_away: number;
    points_earned: number;
}

const STAGE_TRANSLATIONS: Record<string, string> = {
    'GROUP_STAGE': 'GIRONI',
    'LAST_32': 'SEDICESIMI',
    'LAST_16': 'OTTAVI',
    'QUARTER_FINALS': 'QUARTI',
    'SEMI_FINALS': 'SEMIFINALI',
    'THIRD_PLACE': '3° POSTO',
    'FINAL': 'FINALE'
}

const STAGE_ORDER = [
    'GROUP_STAGE',
    'LAST_32',
    'LAST_16',
    'QUARTER_FINALS',
    'SEMI_FINALS',
    'FINAL'
]

export default function MatchList({ matches, predictions }: { matches: Match[], predictions: Prediction[] }) {

    const [openStages, setOpenStages] = useState<Record<string, boolean>>(() => {
        // Cerca l'ultima fase che contiene match validi (escludendo i TBD)
        const latestPopulatedStage = [...STAGE_ORDER].reverse().find(stage => 
            matches.some(m => 
                (m.stage === stage || (stage === 'FINAL' && m.stage === 'THIRD_PLACE')) &&
                m.home_team !== 'TBD' && 
                m.away_team !== 'TBD'
            )
        )
        
        // Se trova una fase con squadre reali, la apre. Altrimenti fallback sui Gironi.
        return latestPopulatedStage ? { [latestPopulatedStage]: true } : { 'GROUP_STAGE': true }
    })

    const toggleStage = (stage: string) => {
        setOpenStages(prev => ({
            ...prev,
            [stage]: !prev[stage]
        }))
    }

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(dateStr))
    }

    const formatTime = (dateStr: string) => {
        return new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(dateStr))
    }

    return (
        <div className="space-y-4">
            {STAGE_ORDER.map((stage) => {
                
                // accorpiamo la finale al 3° posto
                const stageMatches = matches.filter(m =>
                    m.stage === stage || (stage === 'FINAL' && m.stage === 'THIRD_PLACE')
                )

                const isOpen = openStages[stage]

                // TITOLO TENDINA
                const accordionTitle = stage === 'FINAL' ? 'FINALI (1° E 3° POSTO)' : (STAGE_TRANSLATIONS[stage] || stage.replace(/_/g, ' '))
            
                // raggruppiamo per data le partite di QUESTA fase
                const groupedMatches = stageMatches.reduce((acc: Record<string, Match[]>, match: Match) => {
                    const date = formatDate(match.match_time)
                    if (!acc[date]) acc[date] = []
                    acc[date].push(match)
                    return acc
                }, {})

                return (
                    <div key={stage} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all">
                    
                    {/* header accordion cliccabile */}
                    <button
                        onClick={() => toggleStage(stage)}
                        className={`w-full flex items-center justify-between p-5 transition-colors focus:outline-none ${
                            isOpen ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${stageMatches.length > 0 ? (isOpen ? 'bg-white' : 'bg-emerald-500') : 'bg-slate-300'}`}></span>
                            <span className="font-black uppercase tracking-widest text-sm sm:text-base">
                                {accordionTitle}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* mostriamo counter piccolino delle partite previste */}
                            {stageMatches.length > 0 && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isOpen ? 'bg-emerald-700/50 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {stageMatches.length} MATCH
                                </span>
                            )}
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>
                    
                    {/* contenuto della fase (aperto o chiuso) */}
                    {isOpen && (
                        <div className="p-4 sm:p-6 bg-slate-50/50">
                            {stageMatches.length > 0 ? (
                                <div className="space-y-10">
                                    {Object.entries(groupedMatches).map(([date, dayMatches]) => (
                                        <div key={date}>
                                            {/* intestazione data */}
                                            <h3 className="text-xs font-black uppercase tracking-tighter text-emerald-600 mb-4 ml-1 flex items-center gap-2">
                                                <span className="w-8 h-[1px] bg-emerald-200"></span>
                                                {date}
                                            </h3>
                                            
                                            <div className="space-y-3">
                                                {dayMatches.map((match: Match) => {
                                                    const pred = predictions.find(p => p.match_id === match.id)
                                                    // Mostra finito SOLO se ci sono anche i gol effettivi
                                                    const isFinished = match.status?.toLowerCase() === 'finished' && match.home_score !== null && match.away_score !== null
                                                    return (
                                                        <div key={match.id} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4 transition-transform hover:scale-[1.01]">

                                                            {/* orario e fase (sx) */}
                                                            <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between w-full sm:w-auto gap-2 sm:min-w-[80px]">
                                                                <span className="text-sm font-black text-slate-800 tabular-nums">
                                                                    {formatTime(match.match_time)}
                                                                </span>
                                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${match.stage === 'FINAL' ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                    {STAGE_TRANSLATIONS[match.stage] || match.stage.replace(/_/g, ' ')}
                                                                </span>
                                                            </div>

                                                            {/* match (centro) */}
                                                            <div className="flex items-center justify-center gap-3 flex-1 w-full py-2 sm:py-0 border-y sm:border-y-0 sm:border-x border-slate-50">
                                                                <div className="flex items-center gap-2 flex-1 justify-end">
                                                                    <span className="font-black text-slate-700 text-sm sm:text-base">{match.home_team}</span>
                                                                    <img src={match.home_flag} alt="" className="w-6 h-4 object-cover rounded shadow-sm" />
                                                                </div>

                                                                <div className="flex flex-col items-center min-w-[50px]">
                                                                    {isFinished ? (
                                                                        <span className="font-black text-lg text-slate-900 leading-none">
                                                                            {match.home_score} - {match.away_score}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-black text-slate-300 uppercase">vs</span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <img src={match.away_flag} alt="" className="w-6 h-4 object-cover rounded shadow-sm" />
                                                                    <span className="font-black text-slate-700 text-sm sm:text-base">{match.away_team}</span>
                                                                </div>
                                                            </div>

                                                            {/* pronostico e punti (dx) */}
                                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-center w-full sm:w-auto sm:min-w-[100px] gap-4 sm:gap-1.5">

                                                                {/* blocco testo pronostico */}
                                                                <div className="text-center sm:text-right">
                                                                    <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-0.5">pronostico</p>
                                                                    <p className="font-black text-sm text-slate-700 tabular-nums">
                                                                        {pred ? `${pred.guess_home} - ${pred.guess_away}` : '--'}
                                                                    </p>
                                                                </div>

                                                                {/* badge punti guadagnati */}
                                                                {isFinished && pred && (
                                                                    <div className="bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                                                                        <span className="text-[10px] font-black text-emerald-700 whitespace-nowrap">
                                                                            +{pred.points_earned} PT
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // messaggio per fase senza partite
                                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <p className="font-bold text-slate-400">Le partite di questa fase compariranno non appena definite.</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-300 mt-2 tracking-widest">In attesa dei risultati</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                )
            })}
        </div>
    )
}