"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  Gauge,
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

export function QuizDashboardClient({ categories }: QuizDashboardClientProps) {
  const [mode, setMode] = useState<QuizMode>("study");
  const [category, setCategory] = useState<CategorySlug>(
    categories[0]?.slug ?? "equipos-medicos",
  );
  const [difficulty, setDifficulty] = useState<QuizDifficulty | "all">("all");
  const [results, setResults] = useState<LocalQuizResult[]>([]);

  useEffect(() => {
    setResults(readResults());
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

  const startUrl = `/quiz/${category}?mode=${mode}&difficulty=${difficulty}`;

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
        </div>
      </div>
    </section>
  );
}
