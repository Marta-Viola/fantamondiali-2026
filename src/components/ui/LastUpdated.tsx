interface LastUpdatedProps {
    date: string | null | undefined
}

export default function LastUpdated({ date }: LastUpdatedProps) {
    if (!date) return null

    const formattedDate = new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date))

    return (
        <div className="w-full flex justify-center py-10">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Dati aggiornati: <span className="text-slate-600">{formattedDate}</span>
                </p>
            </div>
        </div>
    )
}