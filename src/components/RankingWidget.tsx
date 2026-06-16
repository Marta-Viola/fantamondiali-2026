import Link from 'next/link'

export default function RankingWidget({ users, currentUserId }: { users: any[], currentUserId: string }) {
    const sortedUsers = [...users].sort((a, b) => {
        if (b.total_points !== a.total_points) return b.total_points - a.total_points
        if (b.scores_count !== a.scores_count) return b.scores_count - a.scores_count
        if (b.gd_count !== a.gd_count) return b.gd_count - a.gd_count
        return (a.username || '').localeCompare(b.username || '')
    })

    const topFive = sortedUsers.slice(0, 5);

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-emerald-100">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-black uppercase italic text-slate-800 text-sm tracking-tight">Classifica Top 5</h3>
                <Link href="/classifica" className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 transition-colors">
                    Vedi Tutta →
                </Link>
            </div>

            <div className="space-y-2">
                {topFive.map((user, index) => {
                    const isMe = user.id === currentUserId
                    const rank = index + 1
                    const hasPoints = user.total_points > 0
                    const diff = user.previous_rank ? user.previous_rank - rank : 0

                    let badgeColor = "bg-slate-100 text-slate-400"

                    if (hasPoints) {
                        if (index === 0) badgeColor = "bg-amber-400 text-white"
                        if (index === 1) badgeColor = "bg-slate-300 text-slate-600"
                        if (index === 2) badgeColor = "bg-orange-500 text-white"
                    }

                    return (
                        <div
                            key={user.id}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                isMe
                                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                : 'bg-slate-50 border-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
    
                                {/* Blocco Posizione + Freccina */}
                                <div className="flex items-center gap-1">
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 ${badgeColor}`}>
                                        {hasPoints ? rank : '-'}
                                    </span>
                                    
                                    <div className="w-2 flex items-center justify-center shrink-0">
                                        {hasPoints && diff !== 0 && (
                                            <span className={`${diff > 0 ? 'text-emerald-500' : 'text-rose-500'} text-[8px] font-bold`}>
                                                {diff > 0 ? '▲' : '▼'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Nickname e badge Tu */}
                                <span className={`text-sm truncate ${isMe ? 'font-black text-emerald-700' : 'font-bold text-slate-700'}`}>
                                    {user.username || 'Giocatore'}
                                </span>
                                {isMe && (
                                    <span className="text-[7px] sm:text-[9px] bg-emerald-200 text-emerald-700 px-1 w-fit rounded font-black uppercase shrink-0">
                                        Tu
                                    </span>
                                )}
                                
                            </div>

                            <div className="flex items-center gap-1">
                                <span className={`font-black text-sm ${isMe ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {user.total_points}
                                </span>
                                <span className="text-[9px] opacity-40 font-black uppercase tracking-tighter">PT</span>
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}