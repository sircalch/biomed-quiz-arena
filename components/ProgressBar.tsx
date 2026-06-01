type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.max(0, (current / safeTotal) * 100));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
        <span>Progreso</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
