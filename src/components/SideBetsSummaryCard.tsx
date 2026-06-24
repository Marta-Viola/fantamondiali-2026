// components/SideBetsSummaryCard.tsx

'use client'

interface Team {
    name: string;
    flag: string;
    tla: string;
}

interface Bet {
    id: string;
    label: string;
    type: string;
    round: number;
}

interface Answer {
    side_bet_id: string;
    answer: string;
    numeric_answer: number | null;
    is_correct?: boolean | null;
    // In futuro aggiungeremo qui i punti reali guadagnati: points_earned?: number
}

interface SideBetsSummaryCardProps {
    round: number;
    bets: Bet[];
    answers: Answer[];
    teams: Team[];
}

export default function SideBetsSummaryCard({ round, bets, answers, teams }: SideBetsSummaryCardProps) {
    // Funzione helper aggiornata per escludere parole indesiderate (es: prendi "finalista" ma NON "semifinalista")
    const getAnswersByKeyword = (keyword: string, excludeKeyword?: string) => {
        const matchingBets = bets.filter(b => {
            const matchesKeyword = b.label.toLowerCase().includes(keyword.toLowerCase());
            const doesNotMatchExclude = !excludeKeyword || !b.label.toLowerCase().includes(excludeKeyword.toLowerCase());
            return matchesKeyword && doesNotMatchExclude;
        });
        const matchingBetIds = matchingBets.map(b => b.id);
        return answers.filter(a => matchingBetIds.includes(a.side_bet_id));
    }

    // Estraiamo i gruppi logici usando le keyword "a prova di bomba"
    const semiAnswers = getAnswersByKeyword('semifinal');
    const finalAnswers = getAnswersByKeyword('finalist', 'semi'); // Prende i finalisti, ma salta i semifinalisti
    const winnerAnswer = getAnswersByKeyword('vincit')[0]; // Prende "vincitore" o "vincitrice"
    const resultAnswer = getAnswersByKeyword('risultato')[0];
    const scorerAnswer = getAnswersByKeyword('capocannoniere')[0];

    // Logica dei punti massimi (Dimezza e arrotonda per difetto se Round 2)
    const getTargetPoints = (basePoints: number) => round === 1 ? basePoints : Math.floor(basePoints / 2);

    const maxPoints = {
        semi: getTargetPoints(70),
        final: getTargetPoints(50),
        result: getTargetPoints(15),
        winner: getTargetPoints(35),
        scorer: getTargetPoints(25),
    }

    // Componente interno per renderizzare le squadrette in modo compatto con TLA e Bandiera
    const TeamBadge = ({ teamName }: { teamName: string }) => {
        if (!teamName) return <span className="text-slate-300">-</span>;
        
        const teamData = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
        
        if (teamData) {
            return (
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg shrink-0">
                    <img src={teamData.flag} alt="" className="w-4 h-3 object-cover rounded-[2px] shadow-sm" />
                    <span className="text-[11px] font-black text-slate-700 tracking-wider">{teamData.tla}</span>
                </div>
            );
        }
        // Fallback se non trova la squadra
        return <div className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-600">{teamName}</div>;
    }

    // Componente interno per renderizzare una "Riga" della card
    const SummaryRow = ({ title, maxPt, currentPt = 0, children }: any) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 border-b border-slate-100/50 last:border-0">
            {/* Titolo fisso a sinistra */}
            <div className="flex justify-between items-center w-full sm:w-auto shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</span>
                <span className="sm:hidden text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">
                    <span className={currentPt > 0 ? 'text-emerald-500' : ''}>{currentPt}</span> / {maxPt} PT
                </span>
            </div>
            
            {/* Contenitore flessibile: su mobile a sinistra, su desktop spinge a DESTRA (sm:justify-end) */}
            <div className="flex items-center gap-2 flex-wrap flex-1 sm:justify-end">
                {children}
            </div>

            {/* Punti fissi a destra su desktop */}
            <div className="hidden sm:block text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full shrink-0">
                <span className={currentPt > 0 ? 'text-emerald-500' : ''}>{currentPt}</span> / {maxPt} PT
            </div>
        </div>
    )

    // Se non ci sono risposte per questo round, non mostriamo la card
    if (answers.length === 0) return null;

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-slate-100 mb-6 relative overflow-hidden">
            {/* Etichetta in alto a destra per il round */}
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-[1.5rem] text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${round === 1 ? 'bg-slate-800' : 'bg-emerald-600'}`}>
                Round {round}
            </div>

            <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> I Tuoi Pronostici
            </h3>

            <div className="space-y-1">
                {/* SEMIFINALISTE */}
                {semiAnswers.length > 0 && (
                    <SummaryRow title="Semifinaliste" maxPt={maxPoints.semi} currentPt={0}>
                        {semiAnswers.map(a => <TeamBadge key={a.side_bet_id} teamName={a.answer} />)}
                    </SummaryRow>
                )}

                {/* FINALISTE */}
                {finalAnswers.length > 0 && (
                    <SummaryRow title="Finaliste" maxPt={maxPoints.final} currentPt={0}>
                        {finalAnswers.map(a => <TeamBadge key={a.side_bet_id} teamName={a.answer} />)}
                    </SummaryRow>
                )}

                {/* RISULTATO ESATTO */}
                {resultAnswer && (
                    <SummaryRow title="Ris. Esatto (Finale)" maxPt={maxPoints.result} currentPt={0}>
                        <div className="text-xs font-black text-slate-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                            {resultAnswer.answer}
                        </div>
                    </SummaryRow>
                )}

                {/* VINCITRICE */}
                {winnerAnswer && (
                    <SummaryRow title="Vincitrice" maxPt={maxPoints.winner} currentPt={0}>
                        <TeamBadge teamName={winnerAnswer.answer} />
                    </SummaryRow>
                )}

                {/* CAPOCANNONIERE */}
                {scorerAnswer && (
                    <SummaryRow title="Capocannoniere" maxPt={maxPoints.scorer} currentPt={0}>
                        <div className="flex items-baseline gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1 rounded-lg">
                            <span className="text-xs font-black text-amber-900">{scorerAnswer.answer}</span>
                            <span className="text-[10px] font-bold text-amber-600">({scorerAnswer.numeric_answer || 0} gol)</span>
                        </div>
                    </SummaryRow>
                )}
            </div>
        </div>
    )
}