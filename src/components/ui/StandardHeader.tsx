interface HeaderProps {
    title: string;
    subtitle: string;
}

export default function StandardHeader({ title, subtitle }: HeaderProps) {
    return (
        <header className="bg-emerald-600 text-white p-6 sticky top-0 z-40 shadow-md">
            <h1 className="text-2xl font-black uppercase text-center italic leading-tight">
                {title}
            </h1>
            <p className="text-center text-emerald-100 text-xs mt-1 font-medium">
                {subtitle}
            </p>
        </header>
    );
}