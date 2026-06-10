import { useState } from "react";
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
import CanvasCarAnimation from "../components/Canvas";
import type { Scenario } from "@/types/ScenarioTypes";
import Question from "@/components/Question";

export interface CarModelProps {
  id: number;
  title: string;
  src: string;
  alt: string;
}

export default function Play() {
  const carModels: CarModelProps[] = [
    { id: 1, title: "Ford Focus", src: fordFocusImg, alt: "Rotes Auto" },
    { id: 2, title: "VW Tiguan", src: vwTiguanImg, alt: "Blaues Auto" },
    { id: 3, title: "Porsche 911", src: porsche911Img, alt: "Gelbes Auto" },
    { id: 4, title: "Mini Cooper C", src: miniCooperCImg, alt: "Grünes Auto" },
  ];

  const [isOpen, setIsOpen] = useState(true);
  const [carModel, setCarModel] = useState<CarModelProps | null>(null);

  // Szenario wird sofort gesetzt, sobald Canvas es lädt
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  function handleSelectCar(id: number): void {
    const selectedCar = carModels.find((car) => car.id === id);
    if (selectedCar) {
      setCarModel(selectedCar);
    }
    setIsOpen(false);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Auto-Auswahl-Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mit welchem Auto willst du fahren?</DialogTitle>
            <DialogDescription>Wähle ein Modell.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {carModels.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectCar(item.id)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-all hover:border-primary hover:bg-accent"
              >
                <span className="font-bold text-sm group-hover:text-primary truncate w-full">
                  {item.title}
                </span>
                <div className="overflow-hidden rounded-md bg-muted aspect-video w-full">
                  <img
                    title={item.title}
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                  />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 w-full">
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="w-[40vw] sm:w-[18vw] aspect-9/16 rounded-md shadow-md overflow-hidden bg-slate-900">
            {carModel && (
              <CanvasCarAnimation
                selectedCar={carModel}
                onScenarioLoaded={(scenario) => setActiveScenario(scenario)}
              />
            )}
          </div>
        </div>

        {/* Rechte Spalte */}
        <div className="w-full md:w-100 shrink-0">
          <div className="text-center mb-6">
            <p className="text-lg font-bold">
              Punkte:{" "}
              <span className="text-lg font-bold text-amber-400">0</span>
            </p>
          </div>

          {activeScenario && (
            <div className="border rounded-xl p-5 bg-card shadow-sm">
              <Question scenario={activeScenario} />
            </div>
          )}

          <div className="w-full flex justify-between mt-4">
            <Button className="text-lg w-full sm:w-auto px-6">
              <Repeat className="size-6 text-primary-foreground transition-colors mr-2" />
              <span>Erneut abspielen</span>
            </Button>
            <Button className="text-lg w-full sm:w-auto px-6">
              <MoveRight className="size-6 text-primary-foreground transition-colors mr-2" />
              <span>Weiter</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
