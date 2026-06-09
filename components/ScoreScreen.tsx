type ScoreScreenProps = {
  categoryName: string;
  modeLabel: string;
  difficultyLabel: string;
  score: number;
  total: number;
  percent: number;
  correctCount: number;
  bestStreak: number;
  performanceLabel: string;
  strengths: string[];
  weakAreas: string[];
  recommendations: string[];
};

export function ScoreScreen({
  categoryName,
  modeLabel,
  difficultyLabel,
  score,
  total,
  percent,
  correctCount,
  bestStreak,
  performanceLabel,
  strengths,
  weakAreas,
  recommendations,
}: ScoreScreenProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Resultado final
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{categoryName}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {modeLabel} | Dificultad {difficultyLabel} | Nivel: {performanceLabel}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Puntaje</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {score}/{total}
          </p>
        </article>
        <article className="rounded-md border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs uppercase tracking-wide text-blue-700">Porcentaje</p>
          <p className="mt-1 text-2xl font-semibold text-blue-950">{percent}%</p>
        </article>
        <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Correctas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {correctCount}
          </p>
        </article>
        <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Mejor racha
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{bestStreak}</p>
        </article>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <article className="rounded-md border border-emerald-100 bg-emerald-50 p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Fortalezas
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-md border border-amber-100 bg-amber-50 p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            A reforzar
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {weakAreas.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recomendaciones
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
