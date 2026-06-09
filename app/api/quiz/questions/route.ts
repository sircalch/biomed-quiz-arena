import { NextRequest } from "next/server";

import {
  getQuestionsByCategory,
  isCategorySlug,
  isQuizDifficulty,
} from "@/lib/quiz-engine";
import { QuizDifficulty } from "@/types/quiz";

function parseLimit(value: string | null): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 10;
  }
  return Math.min(Math.floor(parsed), 20);
}

function parseShuffle(value: string | null): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

function parseDifficulty(value: string | null): QuizDifficulty | "all" {
  if (!value || value === "all") {
    return "all";
  }
  return isQuizDifficulty(value) ? value : "all";
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  if (!category || !isCategorySlug(category)) {
    return Response.json(
      { ok: false, error: "Categoria invalida." },
      { status: 400 },
    );
  }

  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));
  const shouldShuffle = parseShuffle(request.nextUrl.searchParams.get("shuffle"));
  const difficulty = parseDifficulty(request.nextUrl.searchParams.get("difficulty"));

  const base = getQuestionsByCategory(category, difficulty);
  const questions = shouldShuffle ? shuffle(base).slice(0, limit) : base.slice(0, limit);

  return Response.json({
    source: "seed",
    category,
    difficulty,
    count: questions.length,
    questions,
  });
}
