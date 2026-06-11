import { fetchScenarioById } from "../api";
import { useRef, useEffect, useState } from "react";
import type { Scenario } from "@/types/ScenarioTypes";
import type { CarModelProps } from "@/routes/Play";

export default function Canvas({
  selectedCar,
  currentScenarioId,
  onScenarioLoaded,
}: {
  selectedCar: CarModelProps;
  currentScenarioId: string;
  onScenarioLoaded: (scenario: Scenario) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  // Verhindert erneutes Rendering des Scenarios, falls Play.tsx die Funktion neu rendert
  const onScenarioLoadedRef = useRef(onScenarioLoaded);
  useEffect(() => {
    onScenarioLoadedRef.current = onScenarioLoaded;
  }, [onScenarioLoaded]);

  // useEffect zum Laden eines Szenarios
  useEffect(() => {
    if (!currentScenarioId) return;

    fetchScenarioById(currentScenarioId).then((data) => {
      if (data) {
        setScenario(data);
        // wird an Play.tsx gemeldet, damit die Fragen rechts erscheinen
        onScenarioLoadedRef.current(data);
      }
    });
  }, [currentScenarioId]);

  // useEffect für Animation
  useEffect(() => {
    if (!scenario) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const carImage = new Image();
    const roadImage = new Image();

    carImage.src = selectedCar.src;
    roadImage.src = scenario.imageUrl;

    let carY = scenario.startpointY;
    let carX = scenario.startpointX;
    let carRotation = -Math.PI / 2; // Auto zeigt nach Norden
    let animationFrameId: number;
    let isCleanedUp = false;

    function draw() {
      if (!canvas || !ctx || !scenario || isCleanedUp) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Straße zeichnen
      ctx.drawImage(roadImage, 0, 0, canvas.width, canvas.height);

      // Auto-Proportionen berechnen
      const targetHeight = 70;
      const aspectRatio = carImage.naturalWidth / carImage.naturalHeight || 1;
      const targetWidth = targetHeight * aspectRatio;

      // Rotation vorbereiten
      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(carRotation);

      // Auto zentriert zeichnen
      ctx.drawImage(
        carImage,
        -targetWidth / 2,
        -targetHeight / 2,
        targetWidth,
        targetHeight,
      );

      ctx.restore();

      // Bewegung nach Norden
      if (carY > scenario.endpointY) {
        carY -= 2;
        animationFrameId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    }

    // Bilder laden
    const loadRoad = new Promise((resolve) => {
      roadImage.onload = resolve;
      roadImage.onerror = () =>
        console.error("Fehler beim Laden des Straßenbildes");
    });

    const loadCar = new Promise((resolve) => {
      carImage.onload = resolve;
      carImage.onerror = () =>
        console.error("Fehler beim Laden des Autobildes");
    });

    Promise.all([loadRoad, loadCar]).then(() => {
      if (!isCleanedUp) {
        draw();
      }
    });

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationFrameId);
    };
  }, [scenario, selectedCar]);

  if (!scenario) {
    return (
      <div className="text-center p-4 text-sm text-slate-500">
        Szenario wird geladen...
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={500}
      className="border border-gray-400 rounded w-full h-full object-cover"
    />
  );
}
