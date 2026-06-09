export function getScoreFromCorrect(correctCount: number): number {
  return correctCount * 10;
}

export function getPerformanceLabel(percent: number): string {
  if (percent >= 90) {
    return "Excelente";
  }
  if (percent >= 75) {
    return "Muy bien";
  }
  if (percent >= 60) {
    return "Buen avance";
  }
  return "Sigue practicando";
}

export function getScorePercent(score: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Number(((score / total) * 100).toFixed(1));
}

export function buildShareSummary(input: {
  categoryName: string;
  score: number;
  total: number;
  bestStreak: number;
}): string {
  const percent = getScorePercent(input.score, input.total);
  return `BioMed Quiz Arena | ${input.categoryName} | Puntaje ${input.score}/${input.total} (${percent}%) | Mejor racha ${input.bestStreak}`;
}
