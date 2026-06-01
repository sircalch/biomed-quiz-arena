import { Bolt, ChartNoAxesColumn, ListChecks, Trophy } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const highlights = [
    "5 categorias iniciales de ingenieria biomedica.",
    "10 preguntas por categoria con feedback inmediato.",
    "Puntaje, racha y resultado compartible.",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-md border border-slate-300 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            BioMed Quiz Arena
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
            Retos rapidos para ingenieria biomedica
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Practica conceptos clave con quizzes cortos, visuales y enfocados en
            uso real.
          </p>
          <section className="mt-6 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <Bolt className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-900">Respuesta rapida</p>
              <p className="mt-1 text-xs text-slate-700">
                Entrenamiento corto para repasos frecuentes.
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <ListChecks className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-900">Categorias</p>
              <p className="mt-1 text-xs text-slate-700">
                Banco inicial con 5 temas tecnicos.
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <ChartNoAxesColumn className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-900">Rendimiento</p>
              <p className="mt-1 text-xs text-slate-700">
                Puntaje y racha en cada sesion.
              </p>
            </article>
          </section>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Empezar ahora
            </Link>
            <Link
              href="/result"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <ChartNoAxesColumn className="h-4 w-4" aria-hidden="true" />
              Ver ultimo resultado
            </Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categorias
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">5</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preguntas
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">50</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Modo
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Rapido</p>
            </article>
          </div>
        </section>

        <section className="rounded-md border border-slate-300 bg-white">
          <header className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Incluye
            </h2>
          </header>
          <ul className="divide-y divide-slate-200 text-sm text-slate-700">
            {highlights.map((item) => (
              <li key={item} className="px-6 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
