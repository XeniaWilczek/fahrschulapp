import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "./ui/button";
import { Repeat } from "lucide-react";
import fordFocusImg from "../assets/FordFocus.png";
import Question from "./Question";
import Canvas from "./Canvas";
import type { Scenario } from "../types/ScenarioTypes";

interface PreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentScenarioId: string | null;
}

export default function PreviewDialog({
  isOpen,
  onOpenChange,
  currentScenarioId,
}: PreviewDialogProps) {
  const previewCar = {
    id: 1,
    title: "Ford Focus",
    src: fordFocusImg,
    alt: "Rotes Auto",
  };

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Setzt Vorschau zurück, wenn Dialog geschlossen wird
  useEffect(() => {
    if (!isOpen) {
      setActiveScenario(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto font-sans">
        <DialogHeader className="text-left">
          <DialogTitle className="font-heading font-bold text-xl text-foreground">
            Szenario-Vorschau: {activeScenario?.title || "Wird geladen..."}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 w-full mt-4">
          {/* Links: Canvas mit Ford Focus */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-[40vw] sm:w-[18vw] aspect-9/16 rounded-md shadow-md overflow-hidden bg-slate-900">
              {currentScenarioId && (
                <Canvas
                  key={animationKey}
                  selectedCar={previewCar}
                  currentScenarioId={currentScenarioId}
                  onScenarioLoaded={(scenario) => setActiveScenario(scenario)}
                />
              )}
            </div>
          </div>

          {/* Rechts: Frage und Antwortmöglichkeiten */}
          <div className="w-full md:flex-1 shrink-0">
            {activeScenario ? (
              <div className="border rounded-xl p-5 bg-card shadow-sm">
                <Question
                  scenario={activeScenario}
                  onAnswerEvaluated={() => {}}
                />
              </div>
            ) : (
              <div className="text-center p-10 text-sm text-slate-500 border rounded-xl bg-card">
                Szenario-Animation wird geladen...
              </div>
            )}

            <div className="w-full flex justify-start mt-4 gap-3">
              <Button
                className="text-sm text-slate-800 px-4"
                variant="outline"
                onClick={() => setAnimationKey((prev) => prev + 1)}
              >
                <Repeat className="size-4 transition-colors mr-2" />
                <span>Erneut abspielen</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
