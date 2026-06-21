import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  Timer,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { QuizDashboardClient } from "@/components/QuizDashboardClient";
import { getAllCategories, getAllQuestions } from "@/lib/quiz-engine";

const CASE_SIMULATOR_URL =
  process.env.NEXT_PUBLIC_CASE_SIMULATOR_URL ??
  "https://biomed-case-simulator.vercel.app";
const REPORT_BUILDER_URL =
  process.env.NEXT_PUBLIC_REPORT_BUILDER_URL ??
  "https://clinical-report-builder.vercel.app";

export default function Home() {
  const categories = getAllCategories();
  const totalQuestions = getAllQuestions().length;

  const metrics = [
    { label: "Categorias", value: categories.length, icon: ClipboardCheck },
    { label: "Preguntas", value: totalQuestions, icon: GraduationCap },
    { label: "Modos", value: "3", icon: Timer },
    { label: "Uso", value: "Pretest", icon: ShieldCheck },
  ];

  const flow = [
    {
      step: "1",
      title: "Estudiar",
      body: "Selecciona categoria, dificultad y modo de practica.",
    },
    {
      step: "2",
      title: "Practicar",
      body: "Conecta el resultado con un caso simulado relacionado.",
    },
    {
      step: "3",
      title: "Documentar",
      body: "Genera evidencia tecnica en Report Builder cuando aplique.",
    },
  ];

  const modes = [
    {
      title: "Modo estudio",
      body: "Feedback inmediato y explicaciones tecnicas despues de cada respuesta.",
      icon: BookOpenCheck,
    },
    {
      title: "Modo reto",
      body: "Temporizador, puntaje y racha para dinamicas rapidas en clase.",
      icon: Trophy,
    },
    {
      title: "Modo examen",
      body: "Respuestas ocultas hasta el final para pretest/postest.",
      icon: FileCheck2,
    },
  ];

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700">
                  <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    BioMed Quiz Arena
                  </p>
                  <p className="text-sm text-slate-500">
                    Modulo academico de repaso y evaluacion rapida
                  </p>
                </div>
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
                Refuerza conceptos de ingenieria biomedica y tecnologia medica
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Configura quizzes por categoria, dificultad y modo de uso para
                repaso, pretest/postest, competencia academica y evidencia de
                actividad.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/categories"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Iniciar practica
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={`${CASE_SIMULATOR_URL}/cases/monitor-sin-spo2`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  Practicar caso SpO2
                </a>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-md border border-slate-200 bg-slate-50/80 p-3"
                  >
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <item.icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-blue-950 p-5 text-white lg:border-l lg:border-t-0 md:p-7">
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  Practica guiada
                </h2>
                <p className="mt-3 text-2xl font-semibold leading-tight">
                  Monitoreo de signos vitales / SpO2
                </p>
                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Ruta recomendada para piloto: quiz de monitoreo, caso de
                  monitor sin lectura de SpO2 y reporte tecnico.
                </p>
                <div className="mt-4 grid gap-2">
                  <Link
                    href="/quiz/monitoreo-signos-vitales?mode=study&difficulty=intermediate"
                    className="inline-flex min-h-10 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
                  >
                    Abrir quiz sugerido
                  </Link>
                  <a
                    href={`${REPORT_BUILDER_URL}/builder/corrective?activity=quiz&category=monitoreo-signos-vitales`}
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Preparar evidencia
                  </a>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {flow.map((item) => (
                  <article
                    key={item.step}
                    className="grid grid-cols-[2rem_1fr] gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-300/15 text-sm font-semibold text-cyan-100">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-blue-100">
                        {item.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-6">
          <QuizDashboardClient categories={categories} />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {modes.map((mode) => (
            <article
              key={mode.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <mode.icon className="h-5 w-5 text-blue-700" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-slate-950">
                {mode.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{mode.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
