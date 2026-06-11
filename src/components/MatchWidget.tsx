import React from 'react'

export interface Match {
    id: number;
    match_time: string;
    stage: string;
    home_team: string;
    away_team: string;
    home_tla: string;
    away_tla: string;
    home_flag: string;
    away_flag: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
}

export interface Prediction {
    match_id: number;
    guess_home: number;
    guess_away: number;
    points_earned: number;
}

export default function MatchWidget({ matches, predictions }: { matches: Match[], predictions: Prediction[] }) {

    // LOGICA DI SELEZIONE: 2 passate e 3 future
    const getDisplayMatches = () => {
        const sorted = [...matches].sort((a, b) =>
            new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
        )

        const past = sorted.filter(m => m.status?.toLowerCase() === 'finished').slice(-2)
        const future = sorted.filter(m => m.status?.toLowerCase() !== 'finished').slice(0, 3)

        return [...past, ...future]
    }

    const displayMatches = getDisplayMatches()

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-emerald-100">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h2 className="font-black text-slate-800 uppercase tracking-tight text-sm">
                    Stato Partite 🏟️
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-full">
                    Ultime & Prossime
                </span>
            </div>

            <div className="divide-y divide-slate-50">
                {displayMatches.map((match) => {
                    const pred = predictions.find(p => p.match_id === match.id)
                    // Mostra finito SOLO se ci sono anche i gol effettivi
                    const isFinished = match.status?.toLowerCase() === 'finished' && match.home_score !== null && match.away_score !== null
                    return (
                        <div key={match.id} className={`p-4 flex items-center justify-between gap-4 ${!isFinished ? 'bg-white' : 'bg-slate-50/30'}`}>

                            {/* Squadre */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex -space-x-1 shrink-0">
                                    <img src={match.home_flag} className="w-5 h-5 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                                    <img src={match.away_flag} className="w-5 h-5 rounded-full object-cover border-2 border-white shadow-sm" />
                                </div>
                                <div className="truncate">
                                    <span className="font-black text-xs text-slate-700 uppercase tabular-nums tracking-tight">
                                        {match.home_tla} - {match.away_tla}
                                    </span>
                                </div>
                            </div>

                            {/* Risultato / Stato */}
                            <div className={`flex flex-col items-center justify-center shrink-0 ${isFinished ? 'min-w-[60px]' : 'w-6 text-center'}`}>
                                {isFinished ? (
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-black text-slate-900">
                                            {match.home_score}-{match.away_score}
                                        </span>
                                        {pred && (
                                            <span className={`text-[9px] font-bold uppercase ${pred.points_earned > 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                                                +{pred.points_earned} PT
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs opacity-40 select-none animate-pulse" title="In arrivo">
                                        ⏳
                                    </span>
                                )}
                            </div>

                            {/* Pronostico utente */}
                            <div className="text-right min-w-[65px] shrink-0">
                                <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">Tuo Pronostico</p>
                                <p className={`font-black text-xs ${!isFinished ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {pred ? `${pred.guess_home}-${pred.guess_away}` : '--'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}