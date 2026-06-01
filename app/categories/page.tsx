import { ListChecks, NotebookPen, Trophy } from "lucide-react";
import Link from "next/link";

import { CategoryCard } from "@/components/CategoryCard";
import { QuizInsightsPanel } from "@/components/QuizInsightsPanel";
import { getAllCategories, getQuestionCountByCategory } from "@/lib/quiz-engine";

export default function CategoriesPage() {
  const categories = getAllCategories();
  const totalQuestions = categories.reduce(
    (acc, category) => acc + getQuestionCountByCategory(category.slug),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Categorias
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Selecciona una categoria
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Cada categoria incluye 10 preguntas con retroalimentacion inmediata.
          </p>
          <section className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Categorias
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{categories.length}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <NotebookPen className="h-4 w-4" aria-hidden="true" />
                Preguntas
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{totalQuestions}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Puntaje maximo
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{totalQuestions * 10}</p>
            </article>
          </section>
        </header>

        <div className="mb-6">
          <QuizInsightsPanel />
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              questionCount={getQuestionCountByCategory(category.slug)}
            />
          ))}
        </section>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
