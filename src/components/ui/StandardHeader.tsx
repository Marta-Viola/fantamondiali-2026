interface HeaderProps {
    title: string
    subtitle: string
    className?: string
}

export default function StandardHeader({ title, subtitle, className }: HeaderProps) {
    const bgColor = className || 'bg-emerald-600'
    
    return (
        <header className={`${bgColor} text-white p-6 sticky top-0 z-40 shadow-md transition-colors duration-500`}>
            <h1 className="text-2xl font-black uppercase text-center italic leading-tight">
                {title}
            </h1>
            <p className="text-center text-white/80 text-xs mt-1 font-medium">
                {subtitle}
            </p>
        </header>
    )
}