import { AnswerButton } from "@/components/AnswerButton";
import { QuizQuestion } from "@/types/quiz";

type QuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  locked: boolean;
  revealAnswer: boolean;
  onSelect: (index: number) => void;
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  locked,
  revealAnswer,
  onSelect,
}: QuestionCardProps) {
  const statusLabel =
    selectedIndex === null ? (locked ? "Sin respuesta" : "Pendiente") : "Respondida";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pregunta {questionNumber} de {totalQuestions}
        </p>
        <span className="inline-flex rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {statusLabel}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-snug text-slate-950">
        {question.question}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {question.difficulty}
        </span>
        {question.relatedEquipment ? (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {question.relatedEquipment}
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-2.5">
        {question.options.map((option, index) => (
          <AnswerButton
            key={option}
            label={option}
            index={index}
            onClick={() => onSelect(index)}
            disabled={locked}
            isSelected={selectedIndex === index}
            isCorrect={question.correctOptionIndex === index}
            reveal={revealAnswer}
          />
        ))}
      </div>
    </section>
  );
}
