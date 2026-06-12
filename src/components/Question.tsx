import { Button } from "./ui/button";
import type { Scenario } from "@/types/ScenarioTypes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Question({
  scenario,
  onAnswerEvaluated,
}: {
  scenario: Scenario;
  onAnswerEvaluated: (isFirstTryCorrect: boolean) => void;
}) {
  const [clickedAnswers, setClickedAnswers] = useState<string[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  const normalize = (s: string) => s.trim().toLowerCase();
  const correctAnswer = normalize(scenario.correctAnswer);

  const isResolved = clickedAnswers.some(
    (ans) => normalize(ans) === correctAnswer,
  );

  // Reset und Mischen bei neuem Szenario
  useEffect(() => {
    setClickedAnswers([]);
    setClickCount(0);

    const answerCopy = [...scenario.answers];
    const allPickedAnswers: string[] = [];
    while (answerCopy.length > 0) {
      const randomPointer = Math.floor(Math.random() * answerCopy.length);
      const [pickedAnswer] = answerCopy.splice(randomPointer, 1);
      allPickedAnswers.push(pickedAnswer);
    }
    setShuffledAnswers(allPickedAnswers);
  }, [scenario]);

  function handleSelectAnswer(answer: string) {
    // wenn die richtige Antwort gewählt wurde, ist kein weiterer Klick möglich
    if (isResolved) return;

    if (clickedAnswers.includes(answer)) return;

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    setClickedAnswers((prev) => [...prev, answer]);

    const isCorrect = normalize(answer) === correctAnswer;

    // Punkt wird nur vergeben, wenn der erste Klick die korrekte Antwort ist
    if (newClickCount === 1) {
      onAnswerEvaluated(isCorrect);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-50 font-bold text-left">
        {scenario.question}
      </p>

      <div className="flex flex-col gap-3">
        {shuffledAnswers.map((answer, index) => {
          const normalizedAnswer = normalize(answer);
          const hasBeenClicked = clickedAnswers.includes(answer);
          const isCorrect = normalizedAnswer === correctAnswer;

          const selectionStyles = hasBeenClicked
            ? isCorrect
              ? "bg-green-600 text-white border-none hover:bg-green-500"
              : "bg-destructive text-destructive-foreground border-none hover:bg-destructive/90"
            : isResolved
              ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary-hover";

          return (
            <Button
              key={index}
              className={cn(
                "justify-start text-left w-full h-auto py-3 px-4 whitespace-normal wrap-break-word transition-all font-medium border",
                selectionStyles,
              )}
              onClick={() => handleSelectAnswer(answer)}
            >
              {answer}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
