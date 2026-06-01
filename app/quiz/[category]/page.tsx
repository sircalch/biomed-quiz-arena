import Link from "next/link";
import { notFound } from "next/navigation";

import { QuizRunner } from "@/components/QuizRunner";
import {
  getAllCategories,
  getCategoryBySlug,
  getQuestionsByCategory,
} from "@/lib/quiz-engine";

type QuizPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return getAllCategories().map((category) => ({ category: category.slug }));
}

export default async function QuizCategoryPage({ params }: QuizPageProps) {
  const { category } = await params;
  const categoryMeta = getCategoryBySlug(category);

  if (!categoryMeta) {
    notFound();
  }

  const questions = getQuestionsByCategory(categoryMeta.slug);
  if (questions.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quiz
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              {categoryMeta.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {categoryMeta.description}
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cambiar categoria
          </Link>
        </header>

        <QuizRunner category={categoryMeta} questions={questions} />
      </main>
    </div>
  );
}
