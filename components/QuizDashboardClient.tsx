"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  Download,
  Gauge,
  History,
  RotateCcw,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CategorySlug, QuizCategory, QuizDifficulty, QuizMode } from "@/types/quiz";

type QuizDashboardClientProps = {
  categories: QuizCategory[];
};

type LocalQuizResult = {
  category: CategorySlug;
  categoryName: string;
  mode: QuizMode;
  difficulty: QuizDifficulty | "all";
  score: number;
  total: number;
  percent: number;
  correctCount: number;
  bestStreak: number;
  completedAt: string;
};

const LOCAL_RESULTS_KEY = "biomed_quiz_results_v2";

const modes: Array<{ value: QuizMode; label: string; detail: string }> = [
  { value: "study", label: "Estudio", detail: "Feedback inmediato" },
  { value: "challenge", label: "Reto", detail: "Timer y racha" },
  { value: "exam", label: "Examen", detail: "Resultado al final" },
];

const difficulties: Array<{ value: QuizDifficulty | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "basic", label: "Basica" },
  { value: "intermediate", label: "Intermedia" },
  { value: "advanced", label: "Avanzada" },
];

function readResults(): LocalQuizResult[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_RESULTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LocalQuizResult[]) : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function downloadCsv(results: LocalQuizResult[]) {
  const rows = [
    [
      "fecha",
      "categoria",
      "modo",
      "dificultad",
      "puntaje",
      "total",
      "porcentaje",
      "correctas",
      "racha_maxima",
    ],
    ...results.map((item) => [
      item.completedAt,
      item.categoryName,
      item.mode,
      item.difficulty,
      String(item.score),
      String(item.total),
      String(item.percent),
      String(item.correctCount),
      String(item.bestStreak),
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "biomed-quiz-arena-resultados.csv";
  link.click();
  URL.revokeObjectURL(href);
}

export function QuizDashboardClient({ categories }: QuizDashboardClientProps) {
  const [mode, setMode] = useState<QuizMode>("study");
  const [category, setCategory] = useState<CategorySlug>(
    categories[0]?.slug ?? "equipos-medicos",
  );
  const [difficulty, setDifficulty] = useState<QuizDifficulty | "all">("all");
  const [results, setResults] = useState<LocalQuizResult[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResults(readResults());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    const attempts = results.length;
    const bestScore = results.reduce((best, item) => Math.max(best, item.percent), 0);
    const byCategory = new Map<CategorySlug, { total: number; count: number; name: string }>();

    for (const result of results) {
      const current = byCategory.get(result.category) ?? {
        total: 0,
        count: 0,
        name: result.categoryName,
      };
      byCategory.set(result.category, {
        total: current.total + result.percent,
        count: current.count + 1,
        name: current.name,
      });
    }

    const categoryAverages = [...byCategory.values()].map((item) => ({
      name: item.name,
      average: item.count > 0 ? item.total / item.count : 0,
    }));
    const strong = categoryAverages.sort((a, b) => b.average - a.average)[0];
    const weak = categoryAverages.sort((a, b) => a.average - b.average)[0];

    return {
      attempts,
      bestScore: Number(bestScore.toFixed(1)),
      strongCategory: strong?.name ?? "Sin datos",
      weakCategory: weak?.name ?? "Sin datos",
    };
  }, [results]);

  const selectedCategoryStats = useMemo(() => {
    const categoryResults = results.filter((item) => item.category === category);
    const latest = categoryResults[0];
    const previous = categoryResults[1];
    const best = categoryResults.reduce(
      (currentBest, item) => Math.max(currentBest, item.percent),
      0,
    );
    const trend =
      latest && previous ? Number((latest.percent - previous.percent).toFixed(1)) : 0;

    return {
      attempts: categoryResults.length,
      latestPercent: latest?.percent ?? 0,
      bestPercent: Number(best.toFixed(1)),
      trend,
    };
  }, [category, results]);

  const startUrl = `/quiz/${category}?mode=${mode}&difficulty=${difficulty}`;

  function handleClearResults() {
    window.localStorage.removeItem(LOCAL_RESULTS_KEY);
    setResults([]);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            Configurar practica
          </h2>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {modes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={mode === item.value}
                  onClick={() => setMode(item.value)}
                  className={`rounded-md border px-3 py-2 text-left transition ${
                    mode === item.value
                      ? "border-blue-700 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs">{item.detail}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Categoria
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CategorySlug)}
                  className="mt-1 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Dificultad
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value as QuizDifficulty | "all")
                  }
                  className="mt-1 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {difficulties.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <Link
            href={startUrl}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            Iniciar practica
          </Link>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Estadisticas locales
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Intentos
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{stats.attempts}</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Gauge className="h-4 w-4" aria-hidden="true" />
                Mejor puntaje
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{stats.bestScore}%</p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Target className="h-4 w-4" aria-hidden="true" />
                Fuerte
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {stats.strongCategory}
              </p>
            </article>
            <article className="rounded-md border border-slate-200 bg-white p-3">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                <Target className="h-4 w-4" aria-hidden="true" />
                A reforzar
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {stats.weakCategory}
              </p>
            </article>
          </div>
          <section className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-950">
              Seguimiento de categoria
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["Intentos", selectedCategoryStats.attempts],
                ["Ultimo", `${selectedCategoryStats.latestPercent}%`],
                ["Mejor", `${selectedCategoryStats.bestPercent}%`],
                [
                  "Cambio",
                  selectedCategoryStats.trend > 0
                    ? `+${selectedCategoryStats.trend}%`
                    : `${selectedCategoryStats.trend}%`,
                ],
              ].map(([label, value]) => (
                <article
                  key={String(label)}
                  className="rounded-md border border-blue-100 bg-white p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {String(label)}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {String(value)}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadCsv(results)}
              disabled={results.length === 0}
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handleClearResults}
              disabled={results.length === 0}
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <section className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <History className="h-4 w-4" aria-hidden="true" />
            Historial reciente
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {results.length} resultados locales
          </span>
        </div>
        <div className="mt-3 grid gap-2">
          {results.slice(0, 5).map((item) => (
            <article
              key={`${item.completedAt}-${item.category}-${item.mode}`}
              className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {item.categoryName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(item.completedAt)} | {item.mode} | {item.difficulty}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 font-semibold text-blue-800">
                  {item.percent}%
                </span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
                  {item.score}/{item.total}
                </span>
                <span className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 font-semibold text-teal-800">
                  Racha {item.bestStreak}
                </span>
              </div>
            </article>
          ))}

          {results.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              Aun no hay resultados guardados en este navegador.
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
