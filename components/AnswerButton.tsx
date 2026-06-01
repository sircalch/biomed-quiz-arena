type AnswerButtonProps = {
  label: string;
  index: number;
  onClick: () => void;
  disabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  reveal: boolean;
};

export function AnswerButton({
  label,
  index,
  onClick,
  disabled,
  isSelected,
  isCorrect,
  reveal,
}: AnswerButtonProps) {
  let style =
    "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50";

  if (reveal && isCorrect) {
    style = "border-emerald-300 bg-emerald-50 text-emerald-800";
  } else if (reveal && isSelected && !isCorrect) {
    style = "border-rose-300 bg-rose-50 text-rose-800";
  } else if (!reveal && isSelected) {
    style = "border-slate-900 bg-slate-900 text-white";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition ${style} disabled:cursor-not-allowed`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            reveal && isCorrect
              ? "bg-emerald-100 text-emerald-700"
              : reveal && isSelected && !isCorrect
                ? "bg-rose-100 text-rose-700"
                : isSelected
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-700"
          }`}
        >
          {String.fromCharCode(65 + index)}
        </span>
        <span>{label}</span>
      </div>
    </button>
  );
}
