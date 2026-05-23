interface HeaderProps {
    title: string
    subtitle: string
    className?: string
}

export default function StandardHeader({ title, subtitle, className }: HeaderProps) {
    const bgColor = className || 'bg-emerald-600'
    
    return (
        <header className={`${bgColor} text-white p-4 sm:p-6 sticky top-0 z-[60] shadow-md transition-colors duration-500`}>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-center italic leading-tight">
                {title}
            </h1>
            <p className="text-center text-white/90 text-[10px] sm:text-xs mt-1 font-medium">
                {subtitle}
            </p>
        </header>
    )
}