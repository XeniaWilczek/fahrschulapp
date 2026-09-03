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
    (answer) => normalize(answer) === correctAnswer,
  );

  useEffect(() => {
    setClickedAnswers([]);
    setClickCount(0);

    const answers = [...scenario.answers];
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setShuffledAnswers(answers);
  }, [scenario]);

  function handleSelectAnswer(answer: string) {
    if (isResolved) return;

    const normalizedSelected = normalize(answer);
    //bereits angeklickte Antwort soll nicht erneut gezählt werden
    if (clickedAnswers.some((ans) => normalize(ans) === normalizedSelected))
      return;

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);
    setClickedAnswers((prev) => [...prev, answer]);

    const isCorrect = normalizedSelected === correctAnswer;

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
        {shuffledAnswers.map((answer) => {
          const normalizedAnswer = normalize(answer);
          const hasBeenClicked = clickedAnswers.some(
            (a) => normalize(a) === normalizedAnswer,
          );
          const isCorrect = normalizedAnswer === correctAnswer;

          const selectionStyles = hasBeenClicked
            ? isCorrect
              ? "bg-green-600 text-white border-none hover:bg-green-500"
              : "bg-destructive text-destructive-foreground border-none hover:bg-destructive/90"
            : "bg-primary text-primary-foreground hover:bg-primary-hover";

          return (
            <Button
              key={answer}
              disabled={isResolved}
              className={cn(
                "justify-start text-left w-full h-auto py-3 px-4 whitespace-normal wrap-break-word transition-all font-medium border",
                selectionStyles,

                "disabled:opacity-100",

                "disabled:pointer-events-auto",

                "disabled:cursor-not-allowed",
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
