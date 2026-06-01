import { AnswerButton } from "@/components/AnswerButton";
import { QuizQuestion } from "@/types/quiz";

type QuestionCardProps = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  locked: boolean;
  onSelect: (index: number) => void;
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  locked,
  onSelect,
}: QuestionCardProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pregunta {questionNumber} de {totalQuestions}
        </p>
        {selectedIndex === null ? (
          <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Pendiente
          </span>
        ) : (
          <span className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Respondida
          </span>
        )}
      </div>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">{question.prompt}</h2>

      <div className="mt-5 space-y-2">
        {question.options.map((option, index) => (
          <AnswerButton
            key={option}
            label={option}
            index={index}
            onClick={() => onSelect(index)}
            disabled={locked}
            isSelected={selectedIndex === index}
            isCorrect={question.correctIndex === index}
            reveal={locked}
          />
        ))}
      </div>
    </section>
  );
}
