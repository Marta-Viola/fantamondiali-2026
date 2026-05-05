interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
    title?: string;
    description: React.ReactNode;
    emoji?: string;
}

export default function StandardModal({
    isOpen,
    onClose,
    onConfirm,
    loading,
    title = "Sei sicuro?",
    description,
    emoji = "⭐"
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Card */}
            <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-5xl mb-6">{emoji}</div>
                <h3 className="text-2xl font-black uppercase text-slate-800 mb-2">{title}</h3>
                <div className="text-slate-500 text-sm mb-8">
                    {description}
                </div>
                
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase hover:bg-emerald-700 transition-all active:scale-95 disabled:bg-slate-300"
                >
                    {loading ? 'Salvataggio...' : 'Sì, conferma!'}
                </button>
            </div>
        </div>
    )
}