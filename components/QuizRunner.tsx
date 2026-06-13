"use client";

import {
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesColumn,
  CloudDownload,
  Gauge,
  RefreshCw,
  Timer,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

const MODE_SHORT_LABEL: Record<QuizMode, string> = {
  study: "Estudio",
  challenge: "Reto",
  exam: "Examen",
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

const QUESTION_SOURCE_LABEL: Record<QuestionSource, string> = {
  seed: "Banco academico local",
  remote: "Banco academico actualizado",
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
  let previous: LocalQuizResult[] = [];
  try {
    const raw = window.localStorage.getItem(LOCAL_RESULTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    previous = Array.isArray(parsed) ? (parsed as LocalQuizResult[]) : [];
  } catch {
    previous = [];
  }
  const next = [result, ...previous].slice(0, 50);
  window.localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(next));
}

function buildCaseUrl(category: CategorySlug): string {
  const url = new URL(CASE_SIMULATOR_URL);
  url.searchParams.set("category", category);
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
    const timer = window.setTimeout(() => {
      const savedAlias = window.localStorage.getItem("biomed_quiz_participant_alias");
      if (savedAlias) {
        setParticipantAlias(savedAlias);
      }
    }, 0);
    return () => window.clearTimeout(timer);
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

  const handleQuestionDurationChange = (value: number) => {
    setQuestionDuration(value);
    setTimeLeft(value);
  };

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
    setTimeLeft(questionDuration);
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
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
      <div className="grid lg:grid-cols-[15.5rem_1fr]">
        <aside className="bg-blue-950 p-5 text-white">
          <h2 className="text-sm font-semibold">BioMed Quiz Arena</h2>
          <nav className="mt-8 space-y-1 text-sm">
            {[
              ["Dashboard", Gauge],
              ["Mis resultados", Trophy],
              ["Categorias", BookOpenCheck],
            ].map(([label, Icon]) => (
              <a
                key={String(label)}
                href={label === "Categorias" ? "/categories" : "/result"}
                className="flex min-h-9 items-center gap-2 rounded-md px-3 text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {String(label)}
              </a>
            ))}
          </nav>

          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
              Modos
            </p>
            <div className="mt-3 space-y-1 text-sm">
              {(["study", "challenge", "exam"] as QuizMode[]).map((item) => (
                <span
                  key={item}
                  className={`flex min-h-9 items-center gap-2 rounded-md px-3 ${
                    item === mode
                      ? "bg-blue-700 text-white"
                      : "text-blue-100"
                  }`}
                >
                  <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                  {MODE_SHORT_LABEL[item]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-7 border-t border-white/10 pt-5 text-sm">
            <Link
              href="/"
              className="flex min-h-9 items-center gap-2 rounded-md px-3 text-blue-100 hover:bg-white/10 hover:text-white"
            >
              <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </aside>

        <div className="min-w-0 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <a href="/categories" className="font-medium text-slate-500 hover:text-blue-700">
                Categoria:
              </a>
              <span className="font-semibold text-slate-900">{category.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 font-semibold text-teal-800">
                Modo: {MODE_SHORT_LABEL[mode]}
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700">
                Dificultad: {DIFFICULTY_LABEL[difficulty]}
              </span>
              <label className="relative">
                <User
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={participantAlias}
                  onChange={(event) => setParticipantAlias(event.target.value)}
                  maxLength={32}
                  aria-label="Alias de participante"
                  className="h-9 w-28 rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs font-semibold text-slate-800"
                />
              </label>
            </div>
            <p className="basis-full text-xs text-slate-500 md:basis-auto">
              {MODE_HELP[mode]}
            </p>
          </header>

          <div className="grid min-h-[32rem] lg:grid-cols-[1fr_20rem]">
            <div className="space-y-4 p-4 md:p-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
                  <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-700 transition-all"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

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
                className={`inline-flex rounded-md border px-4 py-3 text-sm font-medium ${
                  feedbackTone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : feedbackTone === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-blue-100 bg-blue-50 text-blue-800"
                }`}
              >
                {feedbackTone === "success" ? "Respuesta correcta" : feedbackTone === "warning" ? "Respuesta a revisar" : "Retroalimentacion lista"}
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  Marcar para revisar
                </label>
                <button
                  type="button"
                  onClick={() => void goNext()}
                  disabled={!canContinue || sessionSyncStatus === "saving"}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-2 text-sm font-medium text-white transition enabled:hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {currentIndex === totalQuestions - 1 ? "Finalizar quiz" : "Siguiente"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <aside className="space-y-4 border-t border-slate-200 bg-slate-50 p-4 lg:border-l lg:border-t-0">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-950">
                  Explicacion tecnica
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feedbackMessage}
                </p>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-950">
                  Conceptos clave
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>Categoria: {category.name}</li>
                  <li>Dificultad: {DIFFICULTY_LABEL[difficulty]}</li>
                  <li>{question.relatedEquipment ?? "Equipo medico general"}</li>
                </ul>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-950">
                  Caso relacionado
                </h2>
                <a
                  href={buildCaseUrl(category.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-9 items-center justify-center gap-2 rounded-md text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  Practicar caso
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <CloudDownload className="h-4 w-4 text-blue-700" aria-hidden="true" />
                  Banco activo
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {QUESTION_SOURCE_LABEL[questionSource]}
                </p>
                {questionLoadStatus === "loading" ? (
                  <p className="mt-1 text-xs text-slate-500">Preparando preguntas...</p>
                ) : null}
                {questionLoadStatus === "error" ? (
                  <p className="mt-1 text-xs text-amber-700">
                    Se mantiene el banco local.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => void loadRemoteQuestions()}
                  className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Recargar
                </button>
                {sessionSyncStatus !== "idle" ? (
                  <p
                    className={`mt-3 rounded-md border px-2.5 py-1.5 text-xs ${
                      sessionSyncStatus === "saved"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : sessionSyncStatus === "saving"
                          ? "border-slate-200 bg-slate-50 text-slate-700"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {sessionSyncStatus === "saved"
                      ? sessionStorage === "memory"
                        ? "Resultado guardado para esta sesion."
                        : "Resultado registrado para seguimiento docente."
                      : sessionSyncStatus === "saving"
                        ? "Guardando resultado..."
                        : "El resultado esta disponible; no se pudo sincronizar."}
                  </p>
                ) : null}
              </section>

              {isChallenge ? (
                <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <Timer className="h-4 w-4" aria-hidden="true" />
                    Temporizador
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={questionDuration}
                      onChange={(event) =>
                        handleQuestionDurationChange(Number(event.target.value))
                      }
                      disabled={locked}
                      className="min-h-8 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={20}>20s</option>
                      <option value={35}>35s</option>
                      <option value={50}>50s</option>
                    </select>
                    <p className="text-xs font-semibold text-blue-800">
                      Restante: {timeLeft}s
                    </p>
                  </div>
                </section>
              ) : null}
            </aside>
          </div>

          <footer className="grid gap-2 border-t border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Puntaje actual", `${percent}%`, ChartNoAxesColumn],
              ["Racha actual", String(currentStreak), Timer],
              ["Mejor racha", String(bestStreak), Trophy],
              ["Intentos", progressLabel, Gauge],
            ].map(([label, value, Icon]) => (
              <article key={String(label)} className="flex min-h-14 items-center gap-3 rounded-md border border-slate-200 bg-white px-3">
                <Icon className="h-5 w-5 text-blue-700" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500">{String(label)}</p>
                  <p className="text-base font-semibold text-slate-950">{String(value)}</p>
                </div>
              </article>
            ))}
            <a
              href="/result"
              className="inline-flex min-h-14 items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-800 hover:bg-blue-100"
            >
              Ver estadisticas
            </a>
          </footer>
        </div>
      </div>
    </section>
  );
}
