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

export default function MatchList({ matches, predictions }: { matches: Match[], predictions: Prediction[] }) {
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

    const groupedMatches = matches.reduce((acc: Record<string, Match[]>, match: Match) => {
        const date = formatDate(match.match_time)
        if (!acc[date]) acc[date] = []
        acc[date].push(match)
        return acc
    }, {})

    return (
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
                            const isFinished = match.status === 'FINISHED'

                            return (
                                <div key={match.id} className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">

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
                                    <div className="flex flex-col items-center sm:items-end justify-center w-full sm:w-auto sm:min-w-[100px] gap-2">
                                        <div className="text-center sm:text-right">
                                            <p className="text-[9px] font-black uppercase text-slate-400">pronostico</p>
                                            <p className="font-black text-sm text-slate-700">
                                                {pred ? `${pred.guess_home} - ${pred.guess_away}` : '--'}
                                            </p>
                                        </div>

                                        {isFinished && pred && (
                                            <div className="bg-emerald-100 px-3 py-1 rounded-lg">
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
    )
}
