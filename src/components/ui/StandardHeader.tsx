import LogoutButton from './LogoutButton' // Assicurati che il percorso sia corretto

interface HeaderProps {
    title: string
    subtitle: string
    className?: string
}

export default function StandardHeader({ title, subtitle, className }: HeaderProps) {
    const bgColor = className || 'bg-emerald-600'
    
    return (
        <header className={`${bgColor} text-white p-4 sm:p-6 sticky top-0 z-[60] shadow-md transition-colors duration-500 relative flex items-center justify-center`}>
            
            <div className="w-full">
                <h1 className="text-xl sm:text-2xl font-black uppercase text-center italic leading-tight">
                    {title}
                </h1>
                <p className="text-center text-white/90 text-[10px] sm:text-xs mt-1 font-medium">
                    {subtitle}
                </p>
            </div>

            {/* Il bottone posizionato sulla destra */}
            <LogoutButton className="absolute right-4 top-1/2 -translate-y-1/2" />
            
        </header>
    )
}