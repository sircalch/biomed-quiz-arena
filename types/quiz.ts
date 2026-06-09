export const CATEGORY_SLUGS = [
  "equipos-medicos",
  "monitoreo-signos-vitales",
  "bombas-infusion-terapia",
  "desfibrilador-urgencias",
  "esterilizacion-autoclave",
  "seguridad-electrica",
  "bioseguridad-basica",
  "proteccion-radiologica-basica",
  "ingenieria-clinica",
  "reportes-tecnicos-biomedicos",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const QUIZ_MODES = ["study", "challenge", "exam"] as const;
export type QuizMode = (typeof QUIZ_MODES)[number];

export const DIFFICULTY_LEVELS = ["basic", "intermediate", "advanced"] as const;
export type QuizDifficulty = (typeof DIFFICULTY_LEVELS)[number];

export type QuizCategory = {
  slug: CategorySlug;
  name: string;
  description: string;
  shortName: string;
  relatedEquipment: string;
};

export type QuizQuestion = {
  id: string;
  category: CategorySlug;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  relatedCaseId?: string;
  relatedCaseUrl?: string;
  relatedEquipment?: string;
  sourceNote?: string;
};

export type QuizAnswer = {
  questionId: string;
  category: CategorySlug;
  selectedIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  difficulty: QuizDifficulty;
};

export type QuizSummary = {
  category: CategorySlug;
  categoryName: string;
  mode: QuizMode;
  difficulty: QuizDifficulty | "all";
  score: number;
  total: number;
  correctCount: number;
  bestStreak: number;
  completedAt: string;
};
