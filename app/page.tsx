import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Timer,
} from "lucide-react";
import Link from "next/link";

import { QuizDashboardClient } from "@/components/QuizDashboardClient";
import { getAllCategories, getAllQuestions } from "@/lib/quiz-engine";

export default function Home() {
  const categories = getAllCategories();
  const totalQuestions = getAllQuestions().length;

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.09)]">
          <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="p-6 md:p-8">
              <p className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-800">
                <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
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
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                  Case Simulator
                </a>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0 md:p-7">
              <div className="grid gap-3">
                {[
                  { label: "Categorias", value: categories.length, icon: ClipboardCheck },
                  { label: "Preguntas", value: totalQuestions, icon: GraduationCap },
                  { label: "Modos", value: 3, icon: Timer },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="rounded-md border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-300">
                      <item.icon className="h-4 w-4 text-blue-200" aria-hidden="true" />
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </article>
                ))}
                <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-100">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Uso academico
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Ideal para repaso, pretest/postest y dinamicas breves en laboratorio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <QuizDashboardClient categories={categories} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <h2 className="text-lg font-semibold text-slate-950">Modo estudio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Feedback inmediato y explicaciones tecnicas despues de cada
              respuesta para repaso guiado.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <h2 className="text-lg font-semibold text-slate-950">Modo reto</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Temporizador, puntaje y racha para dinamicas rapidas en clase o
              laboratorio.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
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
