'use client'

import Link from 'next/link'

export default function RankingWidget({ users, currentUserId }: { users: any[], currentUserId: string }) {
    const sortedUsers = [...users].sort((a, b) => {
        if (b.total_points !== a.total_points) return b.total_points - a.total_points
        if (b.scores_count !== a.scores_count) return b.scores_count - a.scores_count
        if (b.gd_count !== a.gd_count) return b.gd_count - a.gd_count
        return (a.username || '').localeCompare(b.username || '')
    })

    const topFive = sortedUsers.slice(0, 5);

    // Calcoliamo il punteggio massimo
    const maxScoresCount = Math.max(...users.map(u => u.scores_count || 0))

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
                    
                    // 🛡️ FIX PODIO: index > 2 assicura che il 1°, 2° e 3° non siano mai Indovini
                    const isIndovino = hasPoints && user.scores_count === maxScoresCount && maxScoresCount > 0 && index > 2

                    // Gestione Colore Badge
                    let badgeColor = "bg-slate-100 text-slate-400"
                    if (hasPoints) {
                        if (index === 0) badgeColor = "bg-amber-400 text-white"
                        if (index === 1) badgeColor = "bg-slate-300 text-slate-600"
                        if (index === 2) badgeColor = "bg-orange-500 text-white"
                    }
                    if (isIndovino) {
                        badgeColor = "bg-purple-600 text-white shadow-md shadow-purple-200"
                    }

                    // Gestione Colore Nome
                    let nameColor = isMe ? 'text-emerald-700' : 'text-slate-700'
                    if (isIndovino) {
                        nameColor = 'text-purple-700'
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
                                
                                {/* 🛠️ FIX TOOLTIP: Usiamo 'group' per l'hover CSS senza JavaScript! */}
                                <div className="relative flex items-center gap-2 cursor-help group">
                                    <span className={`text-sm truncate font-black transition-colors ${nameColor}`}>
                                        {user.username || 'Giocatore'}
                                    </span>

                                    {isMe && (
                                        <span className="text-[7px] sm:text-[9px] bg-emerald-200 text-emerald-700 px-1 w-fit rounded font-black uppercase shrink-0">
                                            Tu
                                        </span>
                                    )}

                                    {/* Il Tooltip vero e proprio, appare al group-hover */}
                                    {user.full_name && (
                                        <div className="absolute left-0 top-full mt-1 z-50 bg-slate-800 text-white text-[10px] sm:text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top">
                                            {user.full_name}
                                            {/* Triangolino in alto */}
                                            <div className="absolute bottom-full left-4 -mb-[1px] border-[5px] border-transparent border-b-slate-800"></div>
                                        </div>
                                    )}
                                </div>
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