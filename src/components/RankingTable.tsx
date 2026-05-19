interface UserProfile {
    id: string;
    username: string;
    total_points: number;
    outcomes_count: number; // esiti (da 3pt in su)
    gd_count: number;       // scarti (5pt)
    scores_count: number;   // risultati (8pt)
    previous_rank: number;
}

export default function RankingTable({ users, currentUserId }: { users: UserProfile[], currentUserId: string }) {
    
    // logica indovino
    const maxScoresCountOutsidePodium = users.reduce((max, user, index) => {
        if (index > 2 && user.scores_count > max) {
            return user.scores_count
        }
        return max
    }, 0)
    
    return (
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl overflow-hidden border border-emerald-100">
            <div className="w-full">
                <table className="w-full text-left border-collapse table-fixed sm:table-auto">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-2 sm:px-8 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 text-center w-12 sm:w-24">
                                <span className="hidden sm:inline">Pos.</span>
                                <span className="sm:hidden">#</span>
                            </th>
                            <th className="py-4 px-2 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400">
                                Nickname
                            </th>
                            <th className="py-4 px-1 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 text-center w-10 sm:w-20">
                                <span className="hidden sm:inline">Esiti</span>
                                <span className="sm:hidden">E</span>
                            </th>
                            <th className="py-4 px-1 sm:px-2 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 text-center w-10 sm:w-20">
                                <span className="hidden sm:inline">Scarti</span>
                                <span className="sm:hidden">S</span>
                            </th>
                            <th className="py-4 px-1 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 text-center w-10 sm:w-20">
                                <span className="hidden sm:inline">Risultati</span>
                                <span className="sm:hidden">R</span>
                            </th>
                            <th className="py-4 px-2 sm:px-8 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 text-center w-14 sm:w-28">
                                Punti
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => {
                            const currentRank = index + 1
                            const diff = user.previous_rank ? user.previous_rank - currentRank : 0
                            const isMe = user.id === currentUserId
                            const hasPoints = user.total_points > 0

                            const isIndovino = index > 2 && user.scores_count === maxScoresCountOutsidePodium && maxScoresCountOutsidePodium > 0

                            // gestione stile grafico del bollino numerico della posizione

                            let rankBadgeStyle = "bg-slate-50 text-slate-400"
                            if (hasPoints) {
                                if (index === 0) rankBadgeStyle = "bg-amber-400 text-white shadow-md shadow-amber-200"
                                if (index === 1) rankBadgeStyle = "bg-slate-300 text-slate-700 shadow-md shadow-slate-100"
                                if (index === 2) rankBadgeStyle = "bg-orange-500 text-white shadow-md shadow-orange-100"
                                if (isIndovino) rankBadgeStyle = "bg-purple-600 text-white shadow-md shadow-purple-200"
                            }

                            return (
                                <tr 
                                    key={user.id} 
                                    className={`border-b border-slate-50 transition-colors
                                        ${isMe ? 'bg-emerald-50/60' : ''} 
                                        ${isIndovino && !isMe ? 'bg-purple-50/30' : ''}
                                    `}
                                >
                                    {/* Colonna Posizione */}
                                    <td className="py-4 px-2 sm:px-8 text-center">
                                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                                            {/* mostra il numero solo se ha punti */}
                                            <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-sm shrink-0 ${rankBadgeStyle}`}>
                                                {hasPoints ? currentRank : '-'}
                                            </span>

                                            {/* mostra le freccette solo se ha punti e c'è stato un cambiamento */}
                                            <div className="w-3 flex items-center justify-start">
                                                {hasPoints && diff !== 0 && (
                                                    <span className={`${diff > 0 ? 'text-emerald-500' : 'text-rose-500'} text-[10px] sm:text-xs font-bold`}>
                                                        {diff > 0 ? '▲' : '▼'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Colonna Nickname */}
                                    <td className="py-4 px-2 sm:px-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                            <span className={`text-[11px] sm:text-sm truncate max-w-[55px] xs:max-w-[75px] sm:max-w-none 
                                                ${isMe ? 'font-black text-emerald-700' : ''}
                                                ${isIndovino && !isMe ? 'font-black text-purple-900' : ''}
                                                ${!isMe && !isIndovino ? 'font-bold text-slate-700' : ''}
                                            `}>
                                                {user.username || 'Giocatore'}
                                            </span>

                                            {/* Tag "TU" */}
                                            {isMe && (
                                                <span className="text-[7px] sm:text-[9px] bg-emerald-200 text-emerald-700 px-1 w-fit rounded font-black uppercase shrink-0">
                                                    Tu
                                                </span>
                                            )}

                                            {/* Tag Indovino */}
                                            {isIndovino && (
                                                <span className="text-[7px] sm:text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 w-fit rounded-md font-black uppercase tracking-tight shrink-0 flex items-center gap-0.5">
                                                    🔮 Indovino
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* colonne statistiche */}
                                    <td className="py-4 px-1 text-center text-slate-500 font-medium text-[10px] sm:text-xs">
                                        {user.outcomes_count}
                                    </td>
                                    <td className="py-4 px-1 text-center text-emerald-500 font-bold text-[10px] sm:text-xs">
                                        {user.gd_count}
                                    </td>

                                    {/* colonna risultati esatti */}
                                    <td className="py-4 px-1 text-center">
                                        <span className={`inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold
                                            ${isIndovino 
                                                ? 'bg-purple-100 text-purple-700 font-black scale-105 shadow-xs' 
                                                : 'text-slate-500 font-medium'
                                            }`}
                                            >
                                                {isIndovino ? `🔮 ${user.scores_count}` : user.scores_count}
                                        </span>
                                    </td>
                                    
                                    {/* Colonna punteggio totale */}
                                    <td className="py-4 px-2 sm:px-8 text-center">
                                        <span className={`inline-block min-w-[30px] sm:min-w-[45px] px-2 sm:px-4 py-1 rounded-xl font-black text-[11px] sm:text-sm ${isMe ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.total_points}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}