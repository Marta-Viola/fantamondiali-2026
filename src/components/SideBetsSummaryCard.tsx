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
}

interface SideBetsSummaryCardProps {
    round: number;
    bets: Bet[];
    answers: Answer[];
    teams: Team[];
}

export default function SideBetsSummaryCard({ round, bets, answers, teams }: SideBetsSummaryCardProps) {
    
    const getAnswersByKeyword = (keyword: string, excludeKeyword?: string) => {
        const matchingBets = bets.filter(b => {
            const matchesKeyword = b.label.toLowerCase().includes(keyword.toLowerCase());
            const doesNotMatchExclude = !excludeKeyword || !b.label.toLowerCase().includes(excludeKeyword.toLowerCase());
            return matchesKeyword && doesNotMatchExclude;
        });
        const matchingBetIds = matchingBets.map(b => b.id);
        return answers.filter(a => matchingBetIds.includes(a.side_bet_id));
    }

    const semiAnswers = getAnswersByKeyword('semifinal');
    const finalAnswers = getAnswersByKeyword('finalist', 'semi');
    const winnerAnswer = getAnswersByKeyword('vincit')[0];
    const resultAnswer = getAnswersByKeyword('risultato')[0];
    const scorerAnswer = getAnswersByKeyword('capocannoniere')[0];

    const getTargetPoints = (basePoints: number) => round === 1 ? basePoints : Math.floor(basePoints / 2);

    const maxPoints = {
        semi: getTargetPoints(70),
        final: getTargetPoints(50),
        result: getTargetPoints(15),
        winner: getTargetPoints(35),
        scorer: getTargetPoints(25),
    }

    // 🎯 NUOVA LOGICA: Calcolatore dinamico dei punti correnti (specchio della funzione SQL)
    const getCorrectCount = (ansArray: Answer[]) => ansArray.filter(a => a.is_correct === true).length;

    // Semifinali: 15 pt a squadra (R1) o 7 (R2) + Bonus en plein: 10 (R1) o 7 (R2 - per recuperare arrotondamento)
    const semiCorrectCount = getCorrectCount(semiAnswers);
    const semiBasePts = round === 1 ? 15 : 7;
    const semiBonusPts = round === 1 ? 10 : 7;  // FIX: da 5 a 7 punti
    const currentSemiPts = (semiCorrectCount * semiBasePts) + (semiCorrectCount === 4 ? semiBonusPts : 0);

    // Finali: 25 pt a squadra (R1) o 12 (R2)
    const finalCorrectCount = getCorrectCount(finalAnswers);
    let currentFinalPts = finalCorrectCount * (round === 1 ? 25 : 12);
    // FIX: recupero di 1 punto se ne azzecca due nel Round 2 (12+12 = 24 + 1 = 25)
    if (round == 2 && finalCorrectCount == 2) {
        currentFinalPts += 1;
    }

    // Esito Esatto: 15 pt (R1) o 7 (R2)
    const currentResultPts = resultAnswer?.is_correct ? maxPoints.result : 0;

    // Vincitrice: 35 pt (R1) o 17 (R2)
    const currentWinnerPts = winnerAnswer?.is_correct ? maxPoints.winner : 0;

    // Capocannoniere: SQL dà punti base per il nome + bonus per i gol.
    // Dato che il frontend al momento legge solo un booleano (is_correct) per l'intera scommessa, 
    // mostriamo il punteggio massimo della categoria se flaggato corretto.
    const currentScorerPts = scorerAnswer?.is_correct ? maxPoints.scorer : 0;


    const TeamBadge = ({ teamName, isCorrect }: { teamName: string, isCorrect?: boolean | null }) => {
        if (!teamName) return <span className="text-slate-300">-</span>;
        
        const teamData = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
        
        // Colore dinamico se la risposta è stata valutata giusta
        const bgClass = isCorrect ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-200';
        const textClass = isCorrect ? 'text-emerald-800' : 'text-slate-700';

        if (teamData) {
            return (
                <div className={`flex items-center gap-1.5 border px-2 py-1 rounded-lg shrink-0 ${bgClass}`}>
                    <img src={teamData.flag} alt="" className="w-4 h-3 object-cover rounded-[2px] shadow-sm" />
                    <span className={`text-[11px] font-black tracking-wider ${textClass}`}>{teamData.tla}</span>
                </div>
            );
        }
        return <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${bgClass} ${textClass}`}>{teamName}</div>;
    }

    const SummaryRow = ({ title, maxPt, currentPt = 0, children }: any) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 border-b border-slate-100/50 last:border-0">
            <div className="flex justify-between items-center w-full sm:w-auto shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</span>
                <span className="sm:hidden text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">
                    <span className={currentPt > 0 ? 'text-emerald-500' : ''}>{Math.floor(currentPt)}</span> / {maxPt} PT
                </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap flex-1 sm:justify-end">
                {children}
            </div>

            <div className="hidden sm:block text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full shrink-0">
                <span className={currentPt > 0 ? 'text-emerald-500' : ''}>{Math.floor(currentPt)}</span> / {maxPt} PT
            </div>
        </div>
    )

    if (answers.length === 0) return null;

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-slate-100 mb-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-[1.5rem] text-[9px] font-black uppercase tracking-widest text-white shadow-sm ${round === 1 ? 'bg-slate-800' : 'bg-emerald-600'}`}>
                Round {round}
            </div>

            <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> I Tuoi Pronostici
            </h3>

            <div className="space-y-1">
                {/* SEMIFINALISTE */}
                {semiAnswers.length > 0 && (
                    <SummaryRow title="Semifinaliste" maxPt={maxPoints.semi} currentPt={currentSemiPts}>
                        {semiAnswers.map(a => <TeamBadge key={a.side_bet_id} teamName={a.answer} isCorrect={a.is_correct} />)}
                    </SummaryRow>
                )}

                {/* FINALISTE */}
                {finalAnswers.length > 0 && (
                    <SummaryRow title="Finaliste" maxPt={maxPoints.final} currentPt={currentFinalPts}>
                        {finalAnswers.map(a => <TeamBadge key={a.side_bet_id} teamName={a.answer} isCorrect={a.is_correct} />)}
                    </SummaryRow>
                )}

                {/* RISULTATO ESATTO */}
                {resultAnswer && (
                    <SummaryRow title="Ris. Esatto (Finale)" maxPt={maxPoints.result} currentPt={currentResultPts}>
                        <div className={`text-xs font-black px-3 py-1 rounded-lg tracking-widest border ${resultAnswer.is_correct ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-50 border-emerald-100 text-slate-700'}`}>
                            {resultAnswer.answer || "0-0"}
                        </div>
                    </SummaryRow>
                )}

                {/* VINCITRICE */}
                {winnerAnswer && (
                    <SummaryRow title="Vincitrice" maxPt={maxPoints.winner} currentPt={currentWinnerPts}>
                        <TeamBadge teamName={winnerAnswer.answer} isCorrect={winnerAnswer.is_correct} />
                    </SummaryRow>
                )}

                {/* CAPOCANNONIERE */}
                {scorerAnswer && (
                    <SummaryRow title="Capocannoniere" maxPt={maxPoints.scorer} currentPt={currentScorerPts}>
                        <div className={`flex items-baseline gap-1.5 px-3 py-1 rounded-lg border ${scorerAnswer.is_correct ? 'bg-emerald-100 border-emerald-300' : 'bg-amber-50 border-amber-100'}`}>
                            <span className={`text-xs font-black ${scorerAnswer.is_correct ? 'text-emerald-800' : 'text-amber-900'}`}>{scorerAnswer.answer || "-"}</span>
                            <span className={`text-[10px] font-bold ${scorerAnswer.is_correct ? 'text-emerald-600' : 'text-amber-600'}`}>({scorerAnswer.numeric_answer || 0} gol)</span>
                        </div>
                    </SummaryRow>
                )}
            </div>
        </div>
    )
}