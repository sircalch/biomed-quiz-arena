import {
  ArrowRight,
  BookOpenCheck,
  ListChecks,
  NotebookPen,
  Trophy,
} from "lucide-react";
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
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700">
                  <ListChecks className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Banco academico
                  </p>
                  <h1 className="text-3xl font-semibold text-slate-950">
                    Selecciona una categoria
                  </h1>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                Diez categorias con explicaciones tecnicas, modos de estudio,
                reto y examen, y enlaces hacia casos relacionados cuando aplica.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/quiz/monitoreo-signos-vitales?mode=study&difficulty=intermediate"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Quiz recomendado
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Configurar practica
                </Link>
              </div>
            </div>

            <section className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Categorias", value: categories.length, icon: ListChecks },
                { label: "Preguntas", value: totalQuestions, icon: NotebookPen },
                { label: "Modos", value: "Estudio / Reto / Examen", icon: Trophy },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <item.icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                    {item.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-950">
                    {item.value}
                  </p>
                </article>
              ))}
            </section>
          </div>
        </header>

        <section className="mt-6">
          <QuizInsightsPanel />
        </section>

        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Categorias disponibles
            </h2>
            <p className="text-sm text-slate-500">
              Cada tarjeta abre modo estudio, reto o examen.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.slug}
                category={category}
                questionCount={getQuestionCountByCategory(category.slug)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
