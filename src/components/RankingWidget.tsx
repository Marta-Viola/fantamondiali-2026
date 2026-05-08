import Link from 'next/link'

export default function RankingWidget({ users, currentUserId }: { users: any[], currentUserId: string }) {
    const topFive = users.slice(0, 5);

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
                    // const diff = user.previous_rank ? user.previous_rank - rank : 0

                    let badgeColor = "bg-slate-100 text-slate-400"
                    if (index === 0) badgeColor = "bg-amber-400 text-white"
                    if (index === 1) badgeColor = "bg-slate-300 text-slate-600"
                    if (index === 2) badgeColor = "bg-orange-500 text-white"

                    return (
                        <div key={user.id} className={`flex items-center justify-between p-3 rounded-2xl border ${isMe ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center gap-3">
                                {/* <div className="flex flex-col items-center min-w-[20px]"> */}
                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${badgeColor}`}>
                                        {rank}
                                    </span>
                                    <span className={`text-sm truncate max-w-[100px] ${isMe ? 'font-black text-emerald-700' : 'font-bold text-slate-700'}`}>
                                        {user.username} {isMe && "(Tu"}
                                    </span>
                                    {/* {diff > 0 && <span className="text-emerald-500 text-[8px]">▲</span>}
                                    {diff < 0 && <span className="text-rose-500 text-[8px]">▼</span>}
                                </div> */}
                                {/* <span className="font-bold text-sm text-slate-700 truncate max-w-[120px]">
                                    {user.username}
                                </span> */}
                            </div>
                            {/* <div className="flex items-center gap-1"> */}
                                <span className={`font-black text-sm ${isMe ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {user.total_points} <span className="text-[9px] opacity-50 font-black">PT</span>
                                </span>
                                
                            {/* </div> */}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}