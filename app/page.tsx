import { ArrowRight, BookOpenCheck, ClipboardCheck, GraduationCap } from "lucide-react";
import Link from "next/link";

import { QuizDashboardClient } from "@/components/QuizDashboardClient";
import { getAllCategories, getAllQuestions } from "@/lib/quiz-engine";

export default function Home() {
  const categories = getAllCategories();
  const totalQuestions = getAllQuestions().length;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                BioMedTools MX Core
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-slate-950 md:text-5xl">
                Refuerza conceptos de ingenieria biomedica y tecnologia medica
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Quiz Arena funciona como modulo de repaso, pretest/postest,
                evaluacion rapida y competencia academica para estudiantes,
                docentes y tecnicos biomedicos en formacion.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/categories"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  Ver categorias
                </Link>
                <a
                  href="https://biomed-case-simulator.vercel.app"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                  Case Simulator
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Categorias
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {categories.length}
                </p>
              </article>
              <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                  Preguntas
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {totalQuestions}
                </p>
              </article>
              <article className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Modos
                </p>
                <p className="mt-1 text-2xl font-semibold text-blue-950">3</p>
              </article>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <QuizDashboardClient categories={categories} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Modo estudio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Feedback inmediato y explicaciones tecnicas despues de cada
              respuesta para repaso guiado.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Modo reto</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Temporizador, puntaje y racha para dinamicas rapidas en clase o
              laboratorio.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Modo examen</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Respuestas ocultas hasta el final para uso como pretest/postest y
              evidencia academica.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
