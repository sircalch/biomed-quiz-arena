import { NextRequest } from "next/server";

import { buildQuizStats, listQuizSessions } from "@/lib/server/quiz-sessions-store";

function parseLimit(value: string | null): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 300;
  }
  return Math.min(Math.floor(parsed), 500);
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const { source, sessions } = await listQuizSessions(limit);
  const stats = buildQuizStats(sessions);

  return Response.json({
    source,
    sampleSize: sessions.length,
    stats,
    generatedAt: new Date().toISOString(),
  });
}
