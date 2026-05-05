interface ConfirmButtonProps {
    onClick: () => void;
    loading: boolean;
    text: string;
    icon?: string;
    disabled?: boolean;
    isFloating?: boolean;
}

export default function ConfirmButton({
    onClick,
    loading,
    text,
    icon = "💾",
    disabled,
    isFloating = false
}: ConfirmButtonProps) {

    const buttonContent = (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full max-w-[280px] sm:max-w-md bg-emerald-600/95 backdrop-blur-sm text-white py-4 rounded-full font-black uppercase shadow-[0_15px_30px_rgba(5,150,105,0.4)] hover:bg-emerald-700 hover:-translate-y-1 active:scale-95 disabled:bg-slate-400 transition-all flex items-center justify-center gap-3 border border-emerald-400/30 ring-white/10 pointer-events-auto`}
        >
            {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <div className="flex items-center justify-center gap-3 w-full">
                    <span className="text-xl leading-none">{icon}</span>
                    <span className="leading-none tracking-tight">{text}</span>
                </div>
            )}
        </button>
    );

    if (isFloating) {
        return (
            <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none z-50">
                {buttonContent}
            </div>
        );
    }

    return <div className="flex justify-center w-full mt-8">{buttonContent}</div>;
}