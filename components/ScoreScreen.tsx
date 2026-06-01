type ScoreScreenProps = {
  categoryName: string;
  score: number;
  total: number;
  correctCount: number;
  bestStreak: number;
  performanceLabel: string;
};

export function ScoreScreen({
  categoryName,
  score,
  total,
  correctCount,
  bestStreak,
  performanceLabel,
}: ScoreScreenProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Resultado final
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{categoryName}</h1>
      <p className="mt-1 text-sm text-slate-600">{performanceLabel}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Puntaje</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {score}/{total}
          </p>
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
    </section>
  );
}
