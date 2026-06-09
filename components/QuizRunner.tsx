"use client";

import {
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesColumn,
  CloudDownload,
  ExternalLink,
  FileText,
  Gauge,
  RefreshCw,
  Timer,
  Trophy,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { getScoreFromCorrect, getScorePercent } from "@/lib/scoring";
import {
  CategorySlug,
  QuizAnswer,
  QuizCategory,
  QuizDifficulty,
  QuizMode,
  QuizQuestion,
} from "@/types/quiz";

type QuizRunnerProps = {
  category: QuizCategory;
  questions: QuizQuestion[];
  mode: QuizMode;
  difficulty: QuizDifficulty | "all";
};

type FeedbackTone = "info" | "success" | "warning";
type SessionSyncStatus = "idle" | "saving" | "saved" | "error";
type QuestionSource = "seed" | "remote";

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

const MODE_HELP: Record<QuizMode, string> = {
  study: "Feedback inmediato con explicacion tecnica.",
  challenge: "Temporizador, racha y respuesta rapida para clase.",
  exam: "Sin revelar respuestas hasta el resultado final.",
};

const DIFFICULTY_LABEL: Record<QuizDifficulty | "all", string> = {
  all: "Todas",
  basic: "Basica",
  intermediate: "Intermedia",
  advanced: "Avanzada",
};

function initialFeedback(mode: QuizMode): string {
  if (mode === "exam") {
    return "Selecciona una respuesta. La explicacion se mostrara al finalizar.";
  }
  if (mode === "challenge") {
    return "Selecciona una respuesta antes de que termine el tiempo.";
  }
  return "Selecciona una respuesta para recibir retroalimentacion inmediata.";
}

function computeBestStreak(answers: QuizAnswer[]): number {
  let current = 0;
  let best = 0;

  for (const answer of answers) {
    if (answer.isCorrect) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }

  return best;
}

function saveLocalResult(result: LocalQuizResult) {
  const raw = window.localStorage.getItem(LOCAL_RESULTS_KEY);
  const previous = raw ? (JSON.parse(raw) as LocalQuizResult[]) : [];
  const next = [result, ...previous].slice(0, 50);
  window.localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(next));
}

function buildCaseUrl(category: CategorySlug): string {
  const url = new URL(CASE_SIMULATOR_URL);
  url.searchParams.set("category", category);
  return url.toString();
}

function buildReportUrl(category: CategorySlug, score: number): string {
  const url = new URL(REPORT_BUILDER_URL);
  url.searchParams.set("activity", "quiz");
  url.searchParams.set("category", category);
  url.searchParams.set("score", String(score));
  return url.toString();
}

export function QuizRunner({ category, questions, mode, difficulty }: QuizRunnerProps) {
  const router = useRouter();

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [questionSource, setQuestionSource] = useState<QuestionSource>("seed");
  const [questionLoadStatus, setQuestionLoadStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(initialFeedback(mode));
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("info");
  const [questionDuration, setQuestionDuration] = useState(35);
  const [timeLeft, setTimeLeft] = useState(35);
  const [participantAlias, setParticipantAlias] = useState("Invitado");
  const [sessionSyncStatus, setSessionSyncStatus] =
    useState<SessionSyncStatus>("idle");
  const [sessionStorage, setSessionStorage] = useState<"memory" | "supabase" | null>(
    null,
  );

  const totalQuestions = activeQuestions.length;
  const question = activeQuestions[currentIndex];
  const score = getScoreFromCorrect(correctCount);
  const percent = getScorePercent(score, totalQuestions * 10);
  const isChallenge = mode === "challenge";
  const canContinue = locked;

  const resetSession = useCallback(
    (nextQuestions: QuizQuestion[], source: QuestionSource) => {
      setActiveQuestions(nextQuestions);
      setQuestionSource(source);
      setCurrentIndex(0);
      setSelectedIndex(null);
      setLocked(false);
      setAnswers([]);
      setCorrectCount(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setFeedbackTone("info");
      setFeedbackMessage(initialFeedback(mode));
      setTimeLeft(questionDuration);
      setSessionSyncStatus("idle");
      setSessionStorage(null);
    },
    [mode, questionDuration],
  );

  const loadRemoteQuestions = useCallback(async () => {
    setQuestionLoadStatus("loading");
    try {
      const params = new URLSearchParams({
        category: category.slug,
        limit: "10",
        shuffle: "1",
        difficulty,
      });
      const response = await fetch(`/api/quiz/questions?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar el banco remoto.");
      }

      const payload = (await response.json()) as {
        questions?: QuizQuestion[];
      };
      if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
        throw new Error("El banco remoto no devolvio preguntas.");
      }

      resetSession(payload.questions, "remote");
      setQuestionLoadStatus("idle");
    } catch {
      resetSession(questions, "seed");
      setQuestionLoadStatus("error");
    }
  }, [category.slug, difficulty, questions, resetSession]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRemoteQuestions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRemoteQuestions]);

  const progressLabel = useMemo(() => {
    if (totalQuestions === 0) {
      return "0/0";
    }
    return `${currentIndex + 1}/${totalQuestions}`;
  }, [currentIndex, totalQuestions]);

  useEffect(() => {
    const savedAlias = window.localStorage.getItem("biomed_quiz_participant_alias");
    if (savedAlias) {
      setParticipantAlias(savedAlias);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("biomed_quiz_participant_alias", participantAlias);
  }, [participantAlias]);

  const commitAnswer = useCallback(
    (optionIndex: number | null) => {
      if (locked || !question) {
        return;
      }

      const isCorrect = optionIndex === question.correctOptionIndex;
      const nextStreak = isCorrect ? currentStreak + 1 : 0;
      const nextAnswer: QuizAnswer = {
        questionId: question.id,
        category: question.category,
        selectedIndex: optionIndex ?? -1,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        difficulty: question.difficulty,
      };

      setAnswers((prev) => [...prev, nextAnswer]);
      setSelectedIndex(optionIndex);
      setLocked(true);
      setCurrentStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      if (mode === "exam") {
        setFeedbackTone("info");
        setFeedbackMessage(
          "Respuesta registrada. La retroalimentacion tecnica se concentrara en el resultado final.",
        );
        return;
      }

      if (optionIndex === null) {
        setFeedbackTone("warning");
        setFeedbackMessage(`Tiempo agotado. ${question.explanation}`);
        return;
      }

      setFeedbackTone(isCorrect ? "success" : "warning");
      setFeedbackMessage(
        `${isCorrect ? "Respuesta correcta." : "Respuesta incorrecta."} ${question.explanation}`,
      );
    },
    [currentStreak, locked, mode, question],
  );

  useEffect(() => {
    if (!isChallenge || locked || !question) {
      return;
    }

    setTimeLeft(questionDuration);
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          commitAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [commitAnswer, isChallenge, locked, question, questionDuration, currentIndex]);

  const goNext = async () => {
    if (!canContinue || !question) {
      return;
    }

    const isLastQuestion = currentIndex === totalQuestions - 1;
    if (isLastQuestion) {
      const finalCorrectCount = answers.filter((answer) => answer.isCorrect).length;
      const finalScore = getScoreFromCorrect(finalCorrectCount);
      const finalTotal = totalQuestions * 10;
      const finalPercent = getScorePercent(finalScore, finalTotal);
      const finalBestStreak = computeBestStreak(answers);
      const completedAt = new Date().toISOString();
      let storage: "memory" | "supabase" | "unknown" = "unknown";

      saveLocalResult({
        category: category.slug,
        categoryName: category.name,
        mode,
        difficulty,
        score: finalScore,
        total: finalTotal,
        percent: finalPercent,
        correctCount: finalCorrectCount,
        bestStreak: finalBestStreak,
        completedAt,
      });

      setSessionSyncStatus("saving");
      try {
        const response = await fetch("/api/quiz/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            category: category.slug,
            categoryName: category.name,
            participantAlias: participantAlias.trim() || "Invitado",
            score: finalScore,
            total: finalTotal,
            correctCount: finalCorrectCount,
            bestStreak: finalBestStreak,
            completedAt,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          storage?: "memory" | "supabase";
        };

        if (response.ok && payload.ok) {
          storage = payload.storage ?? "memory";
          setSessionStorage(storage);
          setSessionSyncStatus("saved");
        } else {
          setSessionSyncStatus("error");
        }
      } catch {
        setSessionSyncStatus("error");
      }

      const params = new URLSearchParams({
        category: category.slug,
        categoryName: category.name,
        mode,
        difficulty,
        score: String(finalScore),
        total: String(finalTotal),
        correctCount: String(finalCorrectCount),
        bestStreak: String(finalBestStreak),
        sessionStorage: storage,
      });
      router.push(`/result?${params.toString()}`);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setLocked(false);
    setFeedbackTone("info");
    setFeedbackMessage(initialFeedback(mode));
  };

  if (!question) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          No hay preguntas disponibles
        </h2>
        <p className="mt-2 text-sm text-slate-700">
          Cambia la dificultad o recarga el banco de preguntas para esta categoria.
        </p>
        <button
          type="button"
          onClick={() => void loadRemoteQuestions()}
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reintentar carga
        </button>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <section className="rounded-md border border-blue-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Gauge className="h-4 w-4" aria-hidden="true" />
              Sesion activa
            </h2>
            <p className="text-sm font-medium text-slate-700">{progressLabel}</p>
          </div>
          <label className="mt-2 block text-sm text-slate-700">
            Alias de participante
            <span className="relative mt-1 block">
              <User
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={participantAlias}
                onChange={(event) => setParticipantAlias(event.target.value)}
                maxLength={32}
                placeholder="Nombre o alias"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm text-slate-900"
              />
            </span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {MODE_LABEL[mode]}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Dificultad {DIFFICULTY_LABEL[difficulty]}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Dataset {questionSource}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{MODE_HELP[mode]}</p>
          {questionLoadStatus === "loading" ? (
            <p className="mt-1 text-xs text-slate-600">Sincronizando preguntas...</p>
          ) : null}
          {questionLoadStatus === "error" ? (
            <p className="mt-1 text-xs text-amber-700">
              No se pudo cargar banco remoto. Se usa fallback local.
            </p>
          ) : null}
        </section>

        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedIndex={selectedIndex}
          locked={locked}
          revealAnswer={mode !== "exam" && locked}
          onSelect={commitAnswer}
        />

        <section
          className={`rounded-md border px-4 py-3 text-sm ${
            feedbackTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : feedbackTone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-blue-100 bg-blue-50 text-blue-800"
          }`}
        >
          {feedbackMessage}
        </section>

        <button
          type="button"
          onClick={() => void goNext()}
          disabled={!canContinue || sessionSyncStatus === "saving"}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          {currentIndex === totalQuestions - 1 ? "Finalizar quiz" : "Siguiente"}
        </button>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <ChartNoAxesColumn className="h-4 w-4" aria-hidden="true" />
            Rendimiento
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Puntaje</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {score}/{totalQuestions * 10}
              </dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Avance</dt>
              <dd className="mt-1 font-semibold text-slate-900">{percent}%</dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Racha</dt>
              <dd className="mt-1 font-semibold text-slate-900">{currentStreak}</dd>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Mejor</dt>
              <dd className="mt-1 font-semibold text-slate-900">{bestStreak}</dd>
            </div>
          </dl>

          {isChallenge ? (
            <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <Timer className="h-4 w-4" aria-hidden="true" />
                Temporizador
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  value={questionDuration}
                  onChange={(event) => setQuestionDuration(Number(event.target.value))}
                  disabled={locked}
                  className="min-h-8 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={20}>20s</option>
                  <option value={35}>35s</option>
                  <option value={50}>50s</option>
                </select>
                <p className="text-xs font-semibold text-blue-800">Restante: {timeLeft}s</p>
              </div>
            </div>
          ) : null}

          <p className="mt-3 inline-flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Cada pregunta se bloquea despues de responder.
          </p>
          {sessionSyncStatus !== "idle" ? (
            <p
              className={`mt-2 rounded-md border px-2.5 py-1.5 text-xs ${
                sessionSyncStatus === "saved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : sessionSyncStatus === "saving"
                    ? "border-slate-200 bg-slate-50 text-slate-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {sessionSyncStatus === "saved"
                ? sessionStorage === "memory"
                  ? "Sesion registrada en memoria temporal."
                  : "Sesion registrada en Supabase."
                : sessionSyncStatus === "saving"
                  ? "Guardando sesion..."
                  : "No se pudo guardar la sesion."}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            Flujo academico
          </h2>
          <div className="mt-3 grid gap-2">
            <a
              href={buildCaseUrl(category.slug)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
            >
              Practicar caso relacionado
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={buildReportUrl(category.slug, score)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Generar evidencia de actividad
              <FileText className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <CloudDownload className="h-4 w-4" aria-hidden="true" />
            Banco de preguntas
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Fuente activa: <span className="font-medium text-slate-900">{questionSource}</span>
          </p>
          <button
            type="button"
            onClick={() => void loadRemoteQuestions()}
            className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Recargar preguntas
          </button>
        </section>
      </aside>
    </div>
  );
}
