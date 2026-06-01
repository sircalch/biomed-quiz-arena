import { ArrowRight, FileCheck2, HeartPulse, ShieldAlert, Stethoscope, Wrench } from "lucide-react";
import Link from "next/link";
import { ComponentType } from "react";

import { CategorySlug, QuizCategory } from "@/types/quiz";

type CategoryCardProps = {
  category: QuizCategory;
  questionCount: number;
};

const CATEGORY_ICON: Record<CategorySlug, ComponentType<{ className?: string }>> = {
  "equipos-medicos": HeartPulse,
  "ingenieria-clinica": Stethoscope,
  mantenimiento: Wrench,
  "seguridad-electrica": ShieldAlert,
  "normativa-basica": FileCheck2,
};

export function CategoryCard({ category, questionCount }: CategoryCardProps) {
  const Icon = CATEGORY_ICON[category.slug];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Icon className="h-5 w-5 text-slate-500" aria-hidden="true" />
        {category.name}
      </h3>
      <p className="mt-2 text-sm text-slate-600">{category.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <p className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {questionCount} preguntas
        </p>
        <p className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Puntaje maximo: {questionCount * 10}
        </p>
      </div>
      <Link
        href={`/quiz/${category.slug}`}
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        Jugar categoria
      </Link>
    </article>
  );
}
