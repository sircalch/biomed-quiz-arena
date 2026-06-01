import { NextRequest } from "next/server";

import {
  buildQuizLeaderboard,
  listQuizSessions,
} from "@/lib/server/quiz-sessions-store";
import { CategorySlug, CATEGORY_SLUGS } from "@/types/quiz";

function parseLimit(value: string | null): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 150;
  }
  return Math.min(Math.floor(parsed), 500);
}

function parseCategory(value: string | null): CategorySlug | undefined {
  if (!value) {
    return undefined;
  }
  return CATEGORY_SLUGS.includes(value as CategorySlug)
    ? (value as CategorySlug)
    : undefined;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const category = parseCategory(request.nextUrl.searchParams.get("category"));
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const { source, sessions } = await listQuizSessions(limit, category);
  const leaderboard = buildQuizLeaderboard(sessions);

  return Response.json({
    source,
    category: category ?? "all",
    count: leaderboard.length,
    leaderboard,
  });
}
