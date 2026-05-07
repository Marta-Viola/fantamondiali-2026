export default function StandardMain({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex-1 w-full px-4 pt-6 pb-32">
            {children}
        </main>
    )
}