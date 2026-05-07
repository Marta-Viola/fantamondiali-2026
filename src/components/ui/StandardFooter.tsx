'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function StandardFooter() {
    const pathname = usePathname()

    if (pathname === '/login') return null

    const navItems = [
        { name: 'Pronostici', href: '/pronostici', icon: '⚽' },
        { name: 'Speciali', href: '/side-bets', icon: '⭐' },
        { name: 'Home', href: '/', icon: '🏠', isCenter: true },
        { name: 'Partite', href: '/partite', icon: '🗓️' },
        { name: 'Classifica', href: '/classifica', icon: '📊' }
    ]

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/90 backdrop-blur-md border-t border-emerald-100 z-50 pb-safe shadow-[0_-10px_20px_rgba(6,78,59,0.05)]">
            <div className="flex justify-around items-end px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    if (item.isCenter) {
                        return (
                            <Link key={item.name} href={item.href} className="relative -top-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform active:scale-90 ${isActive ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-800 shadow-slate-200'}`}>
                                    {item.icon}
                                </div>
                            </Link>
                        )
                    }

                    return (
                        <Link key={item.name} href={item.href} className="flex flex-col items-center py-3 px-2 flex-1">
                            <span className={`text-2xl transition-filter ${isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'grayscale'}`}>
                                {item.icon}
                            </span>
                            <span className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}