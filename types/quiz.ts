export const CATEGORY_SLUGS = [
  "equipos-medicos",
  "ingenieria-clinica",
  "mantenimiento",
  "seguridad-electrica",
  "normativa-basica",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type QuizCategory = {
  slug: CategorySlug;
  name: string;
  description: string;
};

export type QuizQuestion = {
  id: string;
  category: CategorySlug;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuizAnswer = {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
};

export type QuizSummary = {
  category: CategorySlug;
  categoryName: string;
  score: number;
  total: number;
  correctCount: number;
  bestStreak: number;
};
