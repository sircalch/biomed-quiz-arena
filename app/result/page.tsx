import { ExternalLink, FileText, ListChecks, Medal, RotateCcw } from "lucide-react";
import Link from "next/link";

import { QuizInsightsPanel } from "@/components/QuizInsightsPanel";
import { ScoreScreen } from "@/components/ScoreScreen";
import { ShareResultCard } from "@/components/ShareResultCard";
import { getCategoryBySlug } from "@/lib/quiz-engine";
import {
  buildShareSummary,
  getPerformanceLabel,
  getScorePercent,
} from "@/lib/scoring";
import { CategorySlug, QuizDifficulty, QuizMode } from "@/types/quiz";

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

const CASE_SIMULATOR_URL =
  process.env.NEXT_PUBLIC_CASE_SIMULATOR_URL ||
  "https://biomed-case-simulator.vercel.app";
const REPORT_BUILDER_URL =
  process.env.NEXT_PUBLIC_REPORT_BUILDER_URL ||
  "https://clinical-report-builder.vercel.app";

const MODE_LABEL: Record<QuizMode, string> = {
  study: "Modo estudio",
  challenge: "Modo reto",
  exam: "Modo examen",
};

const DIFFICULTY_LABEL: Record<QuizDifficulty | "all", string> = {
  all: "Todas",
  basic: "Basica",
  intermediate: "Intermedia",
  advanced: "Avanzada",
};

function buildExternalUrl(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function buildRecommendations(
  percent: number,
  categoryName: string,
  mode: QuizMode,
): string[] {
  if (percent >= 90) {
    return [
      "Resolver un caso relacionado para transferir el conocimiento a diagnostico tecnico.",
      "Generar reporte de evidencia para documentar desempeno en actividad piloto.",
      mode === "exam"
        ? "Usar el resultado como postest o compararlo contra un intento inicial."
        : "Repetir en modo examen para validar retencion sin feedback inmediato.",
    ];
  }

  if (percent >= 75) {
    return [
      `Revisar explicaciones tecnicas de ${categoryName}.`,
      "Practicar un caso relacionado y documentar hallazgos en Report Builder.",
      "Repetir el quiz en modo examen despues de repasar.",
    ];
  }

  return [
    `Repasar la categoria ${categoryName} en modo estudio antes de evaluarla.`,
    "Usar el caso relacionado como practica guiada con supervision docente.",
    "Registrar dudas tecnicas y repetir el intento como postest.",
  ];
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;

  const category = pickFirst(params.category) as CategorySlug;
  const categoryMeta = getCategoryBySlug(category);
  const categoryName = categoryMeta?.name ?? pickFirst(params.categoryName);
  const mode = (pickFirst(params.mode) || "study") as QuizMode;
  const difficulty = (pickFirst(params.difficulty) || "all") as QuizDifficulty | "all";
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

  const percent = getScorePercent(score, total);
  const performanceLabel = getPerformanceLabel(percent);
  const shareSummary = buildShareSummary({
    categoryName,
    score,
    total,
    bestStreak,
  });
  const safeMode = mode in MODE_LABEL ? mode : "study";
  const safeDifficulty = difficulty in DIFFICULTY_LABEL ? difficulty : "all";
  const caseUrl = buildExternalUrl(CASE_SIMULATOR_URL, {
    category: category || "equipos-medicos",
  });
  const reportUrl = buildExternalUrl(REPORT_BUILDER_URL, {
    activity: "quiz",
    category: category || "equipos-medicos",
    categoryName,
    score: String(score),
    total: String(total),
  });
  const repeatUrl = `/quiz/${category || "equipos-medicos"}?mode=${safeMode}&difficulty=${safeDifficulty}`;
  const strengths =
    percent >= 75
      ? [categoryName, `Racha maxima: ${bestStreak}`, `${correctCount} respuestas correctas`]
      : ["Intento completado", "Resultado registrado", "Base para postest"];
  const weakAreas =
    percent >= 75
      ? ["Practicar dificultad avanzada", "Documentar caso relacionado"]
      : [categoryName, "Lectura de explicaciones tecnicas", "Aplicacion en caso simulado"];
  const recommendations = buildRecommendations(percent, categoryName, safeMode);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 md:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ScoreScreen
          categoryName={categoryName}
          modeLabel={MODE_LABEL[safeMode]}
          difficultyLabel={DIFFICULTY_LABEL[safeDifficulty]}
          score={score}
          total={total}
          percent={percent}
          correctCount={correctCount}
          bestStreak={bestStreak}
          performanceLabel={performanceLabel}
          strengths={strengths}
          weakAreas={weakAreas}
          recommendations={recommendations}
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
              Continua el flujo educativo: repaso, caso simulado y evidencia tecnica.
            </p>
            <div className="mt-4 grid gap-2">
              <a
                href={caseUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Practicar caso relacionado
              </a>
              <Link
                href={repeatUrl}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Repetir quiz
              </Link>
              <a
                href={reportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Ir a Report Builder
              </a>
              <Link
                href="/categories"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Medal className="h-4 w-4" aria-hidden="true" />
                Elegir otra categoria
              </Link>
            </div>
          </section>
          <QuizInsightsPanel />
        </div>
      </main>
    </div>
  );
}
