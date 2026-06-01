import { CategorySlug, CATEGORY_SLUGS } from "@/types/quiz";

export type QuizSession = {
  id: string;
  category: CategorySlug;
  categoryName: string;
  participantAlias: string;
  score: number;
  total: number;
  correctCount: number;
  bestStreak: number;
  completedAt: string;
};

type StorageSource = "supabase" | "memory";

const memorySessions: QuizSession[] = [];

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isCategorySlug(value: unknown): value is CategorySlug {
  return typeof value === "string" && CATEGORY_SLUGS.includes(value as CategorySlug);
}

function toIsoDate(value: unknown): string {
  const raw = asString(value);
  if (!raw) {
    return new Date().toISOString();
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function pick(
  record: Record<string, unknown>,
  candidates: string[],
): unknown {
  for (const key of candidates) {
    if (key in record) {
      return record[key];
    }
  }
  return undefined;
}

function normalizeSession(raw: unknown): QuizSession | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const source = raw as Record<string, unknown>;
  const id =
    asString(pick(source, ["id", "external_id"])) ?? crypto.randomUUID();
  const categoryRaw = pick(source, ["category"]);
  const category = isCategorySlug(categoryRaw) ? categoryRaw : null;
  const categoryName = asString(pick(source, ["categoryName", "category_name"]));
  const participantAlias =
    asString(pick(source, ["participantAlias", "participant_alias"])) ??
    "Invitado";
  const score = asNumber(pick(source, ["score"]));
  const total = asNumber(pick(source, ["total"]));
  const correctCount = asNumber(pick(source, ["correctCount", "correct_count"]));
  const bestStreak = asNumber(pick(source, ["bestStreak", "best_streak"]));
  const completedAt = toIsoDate(pick(source, ["completedAt", "completed_at"]));

  if (
    !category ||
    !categoryName ||
    score === null ||
    total === null ||
    correctCount === null ||
    bestStreak === null
  ) {
    return null;
  }

  return {
    id,
    category,
    categoryName,
    participantAlias,
    score,
    total,
    correctCount,
    bestStreak,
    completedAt,
  };
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_QUIZ_SESSIONS_TABLE ?? "quiz_sessions";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    table,
  };
}

async function listSupabaseSessions(
  limit: number,
  category?: CategorySlug,
): Promise<QuizSession[] | null> {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    const endpoint = new URL(`/rest/v1/${config.table}`, config.supabaseUrl);
    endpoint.searchParams.set("select", "*");
    endpoint.searchParams.set("order", "completed_at.desc");
    endpoint.searchParams.set("limit", String(limit));
    if (category) {
      endpoint.searchParams.set("category", `eq.${category}`);
    }

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload)) {
      return null;
    }

    return payload
      .map((item) => normalizeSession(item))
      .filter((item): item is QuizSession => item !== null);
  } catch {
    return null;
  }
}

async function insertSupabaseSession(session: QuizSession): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config) {
    return false;
  }

  try {
    const endpoint = new URL(`/rest/v1/${config.table}`, config.supabaseUrl);
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          external_id: session.id,
          category: session.category,
          category_name: session.categoryName,
          participant_alias: session.participantAlias,
          score: session.score,
          total: session.total,
          correct_count: session.correctCount,
          best_streak: session.bestStreak,
          completed_at: session.completedAt,
        },
      ]),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function listQuizSessions(
  limit = 50,
  category?: CategorySlug,
): Promise<{ source: StorageSource; sessions: QuizSession[] }> {
  const safeLimit = Math.max(1, Math.min(limit, 500));
  const supabaseSessions = await listSupabaseSessions(safeLimit, category);

  if (supabaseSessions) {
    return {
      source: "supabase",
      sessions: supabaseSessions,
    };
  }

  const filtered =
    category === undefined
      ? memorySessions
      : memorySessions.filter((session) => session.category === category);

  return {
    source: "memory",
    sessions: [...filtered]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      )
      .slice(0, safeLimit),
  };
}

export async function addQuizSession(input: unknown): Promise<{
  ok: boolean;
  storage: StorageSource;
  session?: QuizSession;
  error?: string;
}> {
  const session = normalizeSession(input);
  if (!session) {
    return {
      ok: false,
      storage: "memory",
      error: "Formato de sesion invalido.",
    };
  }

  const inserted = await insertSupabaseSession(session);
  if (inserted) {
    return {
      ok: true,
      storage: "supabase",
      session,
    };
  }

  memorySessions.push(session);
  return {
    ok: true,
    storage: "memory",
    session,
  };
}

function scorePercent(session: QuizSession): number {
  return session.total > 0 ? (session.score / session.total) * 100 : 0;
}

export function buildQuizStats(sessions: QuizSession[]) {
  const attempts = sessions.length;
  if (attempts === 0) {
    return {
      attempts: 0,
      averageScorePercent: 0,
      averageBestStreak: 0,
      bestScorePercent: 0,
      categoriesPlayed: 0,
    };
  }

  let totalScorePercent = 0;
  let totalBestStreak = 0;
  let bestScorePercent = 0;
  const categories = new Set<CategorySlug>();

  for (const session of sessions) {
    const percent = scorePercent(session);
    totalScorePercent += percent;
    totalBestStreak += session.bestStreak;
    bestScorePercent = Math.max(bestScorePercent, percent);
    categories.add(session.category);
  }

  return {
    attempts,
    averageScorePercent: Number((totalScorePercent / attempts).toFixed(1)),
    averageBestStreak: Number((totalBestStreak / attempts).toFixed(1)),
    bestScorePercent: Number(bestScorePercent.toFixed(1)),
    categoriesPlayed: categories.size,
  };
}

export function buildQuizLeaderboard(sessions: QuizSession[]) {
  return [...sessions]
    .sort((a, b) => {
      const percentDiff = scorePercent(b) - scorePercent(a);
      if (percentDiff !== 0) {
        return percentDiff;
      }
      if (b.bestStreak !== a.bestStreak) {
        return b.bestStreak - a.bestStreak;
      }
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    })
    .slice(0, 12)
    .map((session) => ({
      id: session.id,
      participantAlias: session.participantAlias,
      category: session.category,
      categoryName: session.categoryName,
      score: session.score,
      total: session.total,
      bestStreak: session.bestStreak,
      completedAt: session.completedAt,
      scorePercent: Number(scorePercent(session).toFixed(1)),
    }));
}
