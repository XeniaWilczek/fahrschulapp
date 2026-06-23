import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import fordFocusImg from "../assets/FordFocus.png";
import vwTiguanImg from "../assets/VWTiguan.png";
import porsche911Img from "../assets/Porsche911.png";
import miniCooperCImg from "../assets/MiniCooperC.png";
import { MoveRight, Repeat } from "lucide-react";
import { Button } from "../components/ui/button";
import type { Scenario } from "@/types/ScenarioTypes";
import Question from "@/components/Question";
import Canvas from "../components/Canvas";
import { useNavigate } from "react-router-dom";
import {
  fetchAllScenarioIds,
  pickFiveRandomIds,
  saveScenarioScore,
} from "../api";

export interface CarModelProps {
  id: number;
  title: string;
  src: string;
  alt: string;
}

const carModels: CarModelProps[] = [
  { id: 1, title: "Ford Focus", src: fordFocusImg, alt: "Rotes Auto" },
  { id: 2, title: "VW Tiguan", src: vwTiguanImg, alt: "Blaues Auto" },
  { id: 3, title: "Porsche 911", src: porsche911Img, alt: "Gelbes Auto" },
  { id: 4, title: "Mini Cooper C", src: miniCooperCImg, alt: "Grünes Auto" },
];

export default function Play() {
  const [isOpen, setIsOpen] = useState(true);
  const [carModel, setCarModel] = useState<CarModelProps | null>(null);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [score, setScore] = useState(0);

  // States für das Runden-Tracking
  const [gameScenarioIds, setGameScenarioIds] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);

  // true oder false (oder null, wenn noch nichts gewählt wurde)
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // id des aktiven Szenarios anhand des aktuellen Index ermitteln
  const currentScenarioId = gameScenarioIds[currentStep];

  const navigate = useNavigate();

  // einmalig Szenario-ids laden, 5 davon auswählen
  async function loadScenarioIds() {
    try {
      const allIds = await fetchAllScenarioIds();
      const selectedFiveIds = pickFiveRandomIds(allIds);
      setGameScenarioIds(selectedFiveIds);
    } catch (error) {
      console.error("Fehler beim Vorbereiten der Szenarien:", error);
    }
  }

  useEffect(() => {
    loadScenarioIds();
  }, []);

  // Funktionalität für CarDialog
  function handleSelectCar(id: number): void {
    const selectedCar = carModels.find((car) => car.id === id);
    if (selectedCar) {
      setCarModel(selectedCar);
      const uniqueGameId = crypto.randomUUID();
      setGameId(uniqueGameId);
    }
    setIsOpen(false);
  }

  // Punkt vergeben, wenn der erste Klick die korrekte Antwort ist
  function handleAnswerEvaluation(isFirstTryCorrect: boolean) {
    if (isFirstTryCorrect) {
      setScore((prev) => prev + 1);
      setIsCurrentCorrect(true);
    } else {
      setIsCurrentCorrect(false);
    }
  }

  // "Weiter" klicken mit Insert in "scores"-Tabelle in Supabase
  async function handleNextScenario() {
    if (!gameId || !activeScenario || isCurrentCorrect === null) return;

    setIsSubmitting(true);
    try {
      // Ergebnis des aktuellen Szenarios in Supabase speichern
      await saveScenarioScore({
        gameId: gameId,
        scenarioId: activeScenario.id.toString(),
        score: isCurrentCorrect ? 1 : 0,
        userId: null,
      });

      // Prüfen, ob noch Szenarien übrig sind
      if (currentStep < gameScenarioIds.length - 1) {
        // Altes Szenario kurz ausblenden (verhindert Textflackern)
        setActiveScenario(null);
        setIsCurrentCorrect(null);
        // Index um +1 erhöhen --> Nächstes Szenario lädt in Canvas
        setCurrentStep((prev) => prev + 1);
      } else {
        alert(`Das Spiel ist beendet! Dein Gesamtpunktestand: ${score} / 5`);
        await finishGame();
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Scores:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function finishGame() {
    // gleich zur Startseite navigieren (Aufflackern des Dialogs vermeiden)
    navigate("/");
    // State erst danach ufräumen.
    setCurrentStep(0);
    setScore(0);
    setIsCurrentCorrect(null);
    setActiveScenario(null);
    setGameScenarioIds([]);
    setGameId(null);
    setCarModel(null);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md font-sans">
          <DialogHeader className="text-left">
            <DialogTitle className="font-heading font-bold text-xl text-foreground">
              Mit welchem Auto willst du fahren?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-sans">
              Wähle ein Modell.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2">
            {carModels.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectCar(item.id)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-input p-2 text-center transition-all bg-background text-foreground hover:border-primary outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <span className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors truncate w-full">
                  {item.title}
                </span>

                <div className="overflow-hidden rounded-md bg-muted aspect-video w-full border border-border/40">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Links: Animation */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 w-full">
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="w-[40vw] sm:w-[18vw] aspect-9/16 rounded-md shadow-md overflow-hidden bg-slate-900">
            {carModel && currentScenarioId && (
              <Canvas
                key={`${currentStep}-${animationKey}`}
                selectedCar={carModel}
                currentScenarioId={currentScenarioId}
                onScenarioLoaded={(scenario) => setActiveScenario(scenario)}
              />
            )}
          </div>
        </div>

        {/* Rechts: Frage und Antwortmöglichkeiten */}
        <div className="w-full md:w-100 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-slate-800 font-bold">
              Szenario:{" "}
              <span className="text-sm text-amber-400 font-bold">
                {currentStep + 1}
              </span>
              <span className="text-sm text-slate-800 font-bold"> / 5</span>
            </p>
            <p className="text-lg font-bold text-slate-800">
              Punkte:{" "}
              <span className="text-lg font-bold text-amber-400">{score}</span>
            </p>
          </div>

          {activeScenario ? (
            <div className="border rounded-xl p-5 bg-card shadow-sm">
              <Question
                scenario={activeScenario}
                onAnswerEvaluated={handleAnswerEvaluation}
              />
            </div>
          ) : (
            <div className="text-center p-10 text-sm text-slate-500 border rounded-xl bg-card">
              Nächstes Szenario wird geladen...
            </div>
          )}

          <div className="w-full flex justify-between mt-4 gap-3">
            <Button
              className="text-lg text-slate-800 w-full sm:w-auto px-6"
              variant="outline"
              onClick={() => setAnimationKey((prev) => prev + 1)}
            >
              <Repeat className="size-6 transition-colors mr-2" />
              <span>Erneut abspielen</span>
            </Button>

            <Button
              className="text-lg text-slate-800 w-full sm:w-auto px-6"
              variant="outline"
              onClick={handleNextScenario}
              disabled={isSubmitting}
            >
              <MoveRight className="size-6 transition-colors mr-2" />
              <span>{isSubmitting ? "Speichert..." : "Weiter"}</span>
            </Button>
          </div>
          <div className="w-full mt-3">
            <Button
              className="text-lg text-slate-800 w-full bg-destructive/80 hover:bg-destructive/60"
              variant="outline"
              onClick={finishGame}
            >
              <span>Spiel beenden</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
