import { Button } from "./ui/button";
import type { Scenario } from "@/types/ScenarioTypes";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Question({ scenario }: { scenario: Scenario }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Normalisierung, um Fehler durch Leerzeichen / Case zu vermeiden
  const normalize = (s: string) => s.trim().toLowerCase();

  const correctAnswer = normalize(scenario.correctAnswer);

  function handleSelectAnswer(answer: string) {
    setSelectedAnswer(answer);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-50 font-bold">{scenario.question}</p>

      <div className="flex flex-col gap-3">
        {scenario.answers.map((answer, index) => {
          const normalizedAnswer = normalize(answer);

          const isSelected = answer === selectedAnswer;
          const isCorrect = normalizedAnswer === correctAnswer;

          const selectionStyles = isSelected
            ? isCorrect
              ? "bg-green-600 text-slate-50 border-none hover:bg-green-500"
              : "bg-red-600 text-slate-50 border-none hover:bg-red-500"
            : "";

          return (
            <Button
              key={index}
              className={cn(
                "justify-start text-left w-full h-auto py-3 px-4 whitespace-normal break-words transition-colors",
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
