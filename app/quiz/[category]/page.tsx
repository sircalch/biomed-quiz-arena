import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/QuizRunner";
import {
  getAllCategories,
  getCategoryBySlug,
  getQuestionsByCategory,
  isQuizDifficulty,
} from "@/lib/quiz-engine";
import { QUIZ_MODES, QuizDifficulty, QuizMode } from "@/types/quiz";

type QuizPageProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    mode?: string;
    difficulty?: string;
  }>;
};

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.slug }));
}

function parseMode(value: string | undefined): QuizMode {
  return QUIZ_MODES.includes(value as QuizMode) ? (value as QuizMode) : "study";
}

function parseDifficulty(value: string | undefined): QuizDifficulty | "all" {
  if (!value || value === "all") {
    return "all";
  }
  return isQuizDifficulty(value) ? value : "all";
}

export default async function QuizCategoryPage({ params, searchParams }: QuizPageProps) {
  const { category } = await params;
  const query = await searchParams;
  const categoryMeta = getCategoryBySlug(category);

  if (!categoryMeta) {
    notFound();
  }

  const mode = parseMode(query.mode);
  const difficulty = parseDifficulty(query.difficulty);
  const questions = getQuestionsByCategory(categoryMeta.slug, difficulty);
  if (questions.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        <QuizRunner
          category={categoryMeta}
          questions={questions}
          mode={mode}
          difficulty={difficulty}
        />
      </main>
    </div>
  );
}
