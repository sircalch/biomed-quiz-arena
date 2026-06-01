import { ListChecks, Medal } from "lucide-react";
import Link from "next/link";

import { QuizInsightsPanel } from "@/components/QuizInsightsPanel";
import { ScoreScreen } from "@/components/ScoreScreen";
import { ShareResultCard } from "@/components/ShareResultCard";
import { buildShareSummary, getPerformanceLabel } from "@/lib/scoring";

type ResultPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function pickFirst(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;

  const categoryName = pickFirst(params.categoryName);
  const score = toNumber(pickFirst(params.score));
  const total = toNumber(pickFirst(params.total));
  const correctCount = toNumber(pickFirst(params.correctCount));
  const bestStreak = toNumber(pickFirst(params.bestStreak));
  const sessionStorage = pickFirst(params.sessionStorage);

  if (!categoryName || total <= 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              Aun no hay resultado
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Completa un quiz para generar puntaje y resumen compartible.
            </p>
            <Link
              href="/categories"
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Ir a categorias
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const performanceLabel = getPerformanceLabel(score);
  const shareSummary = buildShareSummary({
    categoryName,
    score,
    total,
    bestStreak,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ScoreScreen
          categoryName={categoryName}
          score={score}
          total={total}
          correctCount={correctCount}
          bestStreak={bestStreak}
          performanceLabel={performanceLabel}
        />

        <div className="space-y-4">
          <ShareResultCard shareText={shareSummary} />
          {sessionStorage ? (
            <section
              className={`rounded-lg border p-4 text-sm ${
                sessionStorage === "supabase"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {sessionStorage === "supabase"
                ? "Sesion registrada en supabase."
                : "Sesion registrada en memoria temporal (no persistente en Vercel)."}
            </section>
          ) : null}
          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Siguiente paso</h2>
            <p className="mt-2 text-sm text-slate-700">
              Prueba otra categoria para comparar tu racha.
            </p>
            <Link
              href="/categories"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <Medal className="h-4 w-4" aria-hidden="true" />
              Elegir otra categoria
            </Link>
          </section>
          <QuizInsightsPanel />
        </div>
      </main>
    </div>
  );
}
