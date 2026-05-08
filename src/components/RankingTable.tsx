interface UserProfile {
    id: string;
    username: string;
    total_points: number;
    outcomes_count: number;
    scores_count: number;
    previous_rank: number;
}

export default function RankingTable({ users, currentUserId }: { users: UserProfile[], currentUserId: string }) {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-emerald-100">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-5 px-8 text-[10px] font-black uppercase text-slate-400 text-center w-20">Pos.</th>
                            <th className="py-5 px-4 text-[10px] font-black uppercase text-slate-400">Giocatore</th>
                            <th className="py-5 px-4 text-[10px] font-black uppercase text-slate-400 text-center">Esiti</th>
                            <th className="py-5 px-4 text-[10px] font-black uppercase text-slate-400 text-center">Risultati</th>
                            <th className="py-5 px-8 text-[10px] font-black uppercase text-slate-400 text-center w-28">Punti</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => {
                            const currentRank = index + 1
                            const diff = user.previous_rank ? user.previous_rank - currentRank : 0
                            const isMe = user.id === currentUserId

                            let podiumStyle = "bg-slate-50 text-slate-400"
                            if (index === 0) podiumStyle = "bg-amber-400 text-white shadow-md shadow-amber-200"
                            if (index === 1) podiumStyle = "bg-slate-300 text-slate-700 shadow-md shadow-slate-100"
                            if (index === 2) podiumStyle = "bg-orange-500 text-white shadow-md shadow-orange-100"

                            return (
                                <tr 
                                    key={user.id} 
                                    className={`border-b border-slate-50 transition-colors ${isMe ? 'bg-emerald-50/60' : 'hover:bg-slate-50/50'}`}
                                >
                                    <td className="py-5 px-8">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${podiumStyle}`}>
                                                {currentRank}
                                            </span>
                                            <div className="h-2">
                                                {diff > 0 && <span className="text-emerald-500 text-[9px] font-bold">▲</span>}
                                                {diff < 0 && <span className="text-rose-500 text-[9px] font-bold">▼</span>}
                                                {/* {diff === 0 && <span className="text-slate-300 text-[10px]">-</span>} */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm ${isMe ? 'font-black text-emerald-700' : 'font-bold text-slate-700'}`}>
                                                {user.username || 'Giocatore'}
                                            </span>
                                            {isMe && <span className="text-[9px] bg-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Tu</span>}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-center text-slate-500 font-medium text-sm">{user.outcomes_count}</td>
                                    <td className="py-5 px-4 text-center text-slate-500 font-medium text-sm">{user.scores_count}</td>
                                    <td className="py-5 px-8 text-center">
                                        <span className={`inline-block px-4 py-1.5 rounded-2xl font-black text-sm ${isMe ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
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