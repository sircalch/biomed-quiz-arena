import { QUIZ_QUESTIONS } from "@/data/questions";
import {
  CATEGORY_SLUGS,
  CategorySlug,
  DIFFICULTY_LEVELS,
  QuizDifficulty,
  QuizCategory,
  QuizQuestion,
} from "@/types/quiz";

export const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    slug: "equipos-medicos",
    name: "Equipos medicos basicos",
    shortName: "Equipos",
    description: "Conceptos base de dispositivos, accesorios, uso seguro y trazabilidad.",
    relatedEquipment: "Monitor, bomba, autoclave, desfibrilador",
  },
  {
    slug: "monitoreo-signos-vitales",
    name: "Monitoreo de signos vitales",
    shortName: "Monitoreo",
    description: "Senales, sensores, alarmas y calidad de medicion en monitoreo basico.",
    relatedEquipment: "Monitor multiparametrico",
  },
  {
    slug: "bombas-infusion-terapia",
    name: "Bombas de infusion y terapia",
    shortName: "Bombas",
    description: "Alarmas, consumibles, flujo, oclusion y verificacion tecnica.",
    relatedEquipment: "Bomba volumetrica y bomba de jeringa",
  },
  {
    slug: "desfibrilador-urgencias",
    name: "Desfibrilador y urgencias",
    shortName: "Urgencias",
    description: "Disponibilidad, accesorios, energia, autotest y seguridad operativa.",
    relatedEquipment: "Desfibrilador y DEA",
  },
  {
    slug: "esterilizacion-autoclave",
    name: "Esterilizacion y autoclave",
    shortName: "Esterilizacion",
    description: "Ciclos, indicadores, carga, secado y trazabilidad del proceso.",
    relatedEquipment: "Autoclave",
  },
  {
    slug: "seguridad-electrica",
    name: "Seguridad electrica hospitalaria",
    shortName: "Seguridad electrica",
    description: "Corriente de fuga, tierra, partes aplicadas y pruebas de seguridad.",
    relatedEquipment: "Analizador de seguridad electrica",
  },
  {
    slug: "bioseguridad-basica",
    name: "Bioseguridad basica",
    shortName: "Bioseguridad",
    description: "EPP, residuos, descontaminacion y documentacion sin datos sensibles.",
    relatedEquipment: "Equipo contaminado y accesorios reutilizables",
  },
  {
    slug: "proteccion-radiologica-basica",
    name: "Proteccion radiologica basica",
    shortName: "Radiologia",
    description: "ALARA, dosimetria, blindaje, senalizacion y control de calidad.",
    relatedEquipment: "Rayos X y accesorios plomados",
  },
  {
    slug: "ingenieria-clinica",
    name: "Ingenieria clinica y mantenimiento",
    shortName: "Ing. clinica",
    description: "Inventario, priorizacion, preventivo, correctivo e indicadores.",
    relatedEquipment: "Gestion tecnologica hospitalaria",
  },
  {
    slug: "reportes-tecnicos-biomedicos",
    name: "Reportes tecnicos biomedicos",
    shortName: "Reportes",
    description: "Estructura, evidencia, privacidad, cierre y recomendaciones tecnicas.",
    relatedEquipment: "Documentacion biomedica",
  },
];

const allQuestions = QUIZ_QUESTIONS;

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_SLUGS.includes(value as CategorySlug);
}

export function isQuizDifficulty(value: string): value is QuizDifficulty {
  return DIFFICULTY_LEVELS.includes(value as QuizDifficulty);
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

export function getAllQuestions(): QuizQuestion[] {
  return allQuestions;
}

export function getQuestionsByCategory(
  slug: CategorySlug,
  difficulty: QuizDifficulty | "all" = "all",
): QuizQuestion[] {
  return allQuestions
    .filter((question) => question.category === slug)
    .filter((question) => difficulty === "all" || question.difficulty === difficulty);
}

export function getQuestionCountByCategory(
  slug: CategorySlug,
  difficulty: QuizDifficulty | "all" = "all",
): number {
  return getQuestionsByCategory(slug, difficulty).length;
}

export function getDifficultyLabel(difficulty: QuizDifficulty | "all"): string {
  const labels: Record<QuizDifficulty | "all", string> = {
    all: "Todas",
    basic: "Basica",
    intermediate: "Intermedia",
    advanced: "Avanzada",
  };
  return labels[difficulty];
}
