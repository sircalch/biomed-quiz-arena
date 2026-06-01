import rawQuestions from "@/data/questions.json";
import {
  CATEGORY_SLUGS,
  CategorySlug,
  QuizCategory,
  QuizQuestion,
} from "@/types/quiz";

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    slug: "equipos-medicos",
    name: "Equipos Medicos",
    description: "Conceptos base de dispositivos y parametros clinicos.",
  },
  {
    slug: "ingenieria-clinica",
    name: "Ingenieria Clinica",
    description: "Gestion tecnologica, indicadores y trazabilidad tecnica.",
  },
  {
    slug: "mantenimiento",
    name: "Mantenimiento",
    description: "Practicas preventivas, correctivas y cierre de servicio.",
  },
  {
    slug: "seguridad-electrica",
    name: "Seguridad Electrica",
    description: "Riesgo electrico, fuga, tierra y pruebas de seguridad.",
  },
  {
    slug: "normativa-basica",
    name: "Normativa Basica",
    description: "Cumplimiento, documentacion y control de procesos tecnicos.",
  },
];

const allQuestions = rawQuestions as QuizQuestion[];

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_SLUGS.includes(value as CategorySlug);
}

export function getAllCategories(): QuizCategory[] {
  return QUIZ_CATEGORIES;
}

export function getCategoryBySlug(slug: string): QuizCategory | undefined {
  if (!isCategorySlug(slug)) {
    return undefined;
  }
  return QUIZ_CATEGORIES.find((category) => category.slug === slug);
}

export function getQuestionsByCategory(slug: CategorySlug): QuizQuestion[] {
  return allQuestions.filter((question) => question.category === slug).slice(0, 10);
}

export function getQuestionCountByCategory(slug: CategorySlug): number {
  return allQuestions.filter((question) => question.category === slug).length;
}
