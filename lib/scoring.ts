export function getScoreFromCorrect(correctCount: number): number {
  return correctCount * 10;
}

export function getPerformanceLabel(score: number): string {
  if (score >= 90) {
    return "Excelente";
  }
  if (score >= 70) {
    return "Muy bien";
  }
  if (score >= 50) {
    return "Buen inicio";
  }
  return "Sigue practicando";
}

export function buildShareSummary(input: {
  categoryName: string;
  score: number;
  total: number;
  bestStreak: number;
}): string {
  return `BioMed Quiz Arena | ${input.categoryName} | Puntaje ${input.score}/${input.total} | Mejor racha ${input.bestStreak}`;
}
