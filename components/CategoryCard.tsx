import {
  Activity,
  ArrowRight,
  Biohazard,
  ClipboardCheck,
  FileCheck2,
  HeartPulse,
  Radiation,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ComponentType } from "react";

import { CategorySlug, QuizCategory } from "@/types/quiz";

type CategoryCardProps = {
  category: QuizCategory;
  questionCount: number;
};

const CATEGORY_ICON: Record<CategorySlug, ComponentType<{ className?: string }>> = {
  "equipos-medicos": HeartPulse,
  "monitoreo-signos-vitales": Activity,
  "bombas-infusion-terapia": Syringe,
  "desfibrilador-urgencias": Zap,
  "esterilizacion-autoclave": ShieldCheck,
  "seguridad-electrica": ShieldAlert,
  "bioseguridad-basica": Biohazard,
  "proteccion-radiologica-basica": Radiation,
  "ingenieria-clinica": Stethoscope,
  "reportes-tecnicos-biomedicos": FileCheck2,
};

const modes = [
  { href: "study", label: "Estudio" },
  { href: "challenge", label: "Reto" },
  { href: "exam", label: "Examen" },
];

export function CategoryCard({ category, questionCount }: CategoryCardProps) {
  const Icon = CATEGORY_ICON[category.slug];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold leading-tight text-slate-950">
            {category.name}
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {category.relatedEquipment}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600">{category.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <p className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {questionCount} preguntas
        </p>
        <p className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Puntaje maximo: {questionCount * 10}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={`/quiz/${category.slug}?mode=${mode.href}&difficulty=all`}
            className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode.href === "study"
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {mode.href === "study" ? (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            )}
            {mode.label}
          </Link>
        ))}
      </div>
    </article>
  );
}
