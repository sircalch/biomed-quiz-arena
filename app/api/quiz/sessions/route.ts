import { NextRequest } from "next/server";

import { addQuizSession, listQuizSessions } from "@/lib/server/quiz-sessions-store";
import { CategorySlug, CATEGORY_SLUGS } from "@/types/quiz";

function parseLimit(value: string | null): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 50;
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

  return Response.json({
    source,
    count: sessions.length,
    sessions,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const result = await addQuizSession(body);

    if (!result.ok) {
      return Response.json(
        { ok: false, error: result.error ?? "No se pudo guardar la sesion." },
        { status: 400 },
      );
    }

    return Response.json({
      ok: true,
      storage: result.storage,
      session: result.session,
    });
  } catch {
    return Response.json(
      { ok: false, error: "Solicitud invalida." },
      { status: 400 },
    );
  }
}
