"use client";

import { BarChart3, Medal, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type LeaderboardItem = {
  id: string;
  participantAlias: string;
  categoryName: string;
  score: number;
  total: number;
  bestStreak: number;
  scorePercent: number;
};

type QuizStats = {
  attempts: number;
  averageScorePercent: number;
  averageBestStreak: number;
  bestScorePercent: number;
  categoriesPlayed: number;
};

function formatScore(score: number, total: number) {
  return `${score}/${total}`;
}

export function QuizInsightsPanel() {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("loading");

  const loadInsights = async () => {
    setStatus("loading");

    try {
      const [statsResponse, leaderboardResponse] = await Promise.all([
        fetch("/api/quiz/stats", { cache: "no-store" }),
        fetch("/api/quiz/leaderboard", { cache: "no-store" }),
      ]);

      if (!statsResponse.ok || !leaderboardResponse.ok) {
        throw new Error("No se pudieron cargar insights.");
      }

      const statsPayload = (await statsResponse.json()) as {
        stats?: QuizStats;
      };
      const leaderboardPayload = (await leaderboardResponse.json()) as {
        leaderboard?: LeaderboardItem[];
      };

      if (!statsPayload.stats || !Array.isArray(leaderboardPayload.leaderboard)) {
        throw new Error("Respuesta de insights incompleta.");
      }

      setStats(statsPayload.stats);
      setLeaderboard(leaderboardPayload.leaderboard);
      setStatus("idle");
    } catch {
      setStatus("error");
      setStats(null);
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInsights();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Ranking y estadisticas
        </h2>
        <button
          type="button"
          onClick={() => void loadInsights()}
          className="inline-flex min-h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {status === "loading" ? (
        <p className="mt-3 text-sm text-slate-600">Cargando ranking...</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No se pudieron cargar las estadisticas.
        </p>
      ) : null}

      {stats ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          <article className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Intentos</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{stats.attempts}</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Promedio</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {stats.averageScorePercent}%
            </p>
          </article>
          <article className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Racha media</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {stats.averageBestStreak}
            </p>
          </article>
          <article className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Mejor puntaje
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {stats.bestScorePercent}%
            </p>
          </article>
          <article className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Categorias jugadas
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {stats.categoriesPlayed}
            </p>
          </article>
        </div>
      ) : null}

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Medal className="h-4 w-4" aria-hidden="true" />
          Top sesiones
        </h3>
        {leaderboard.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Aun no hay sesiones registradas en ranking.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {leaderboard.slice(0, 6).map((entry, index) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
              >
                <span className="font-medium text-slate-900">
                  {index + 1}. {entry.participantAlias} - {entry.categoryName}
                </span>
                <span>
                  {formatScore(entry.score, entry.total)} ({entry.scorePercent}%) - racha{" "}
                  {entry.bestStreak}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Las estadisticas se actualizan con los intentos disponibles del entorno.
      </p>
    </section>
  );
}
