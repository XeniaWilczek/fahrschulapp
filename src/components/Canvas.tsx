import { fetchScenarioById, getSignedUrl } from "../api";
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
  const [signedRoadUrl, setSignedRoadUrl] = useState<string | null>(null);

  //Verhindert erneutes Rendering des Scenarios, falls Play.tsx die Funktion neu rendert
  const onScenarioLoadedRef = useRef(onScenarioLoaded);

  useEffect(() => {
    onScenarioLoadedRef.current = onScenarioLoaded;
  }, [onScenarioLoaded]);

  // useEffect zum Laden eines Szenarios
  useEffect(() => {
    if (!currentScenarioId) return;

    fetchScenarioById(currentScenarioId).then(async (data) => {
      if (data) {
        setScenario(data);
        onScenarioLoaded(data);

        // signedURL für das Hintergrundbild holen (1 h gültig)
        const url = await getSignedUrl(data.imageUrl, 3600);
        setSignedRoadUrl(url);
      }
    });
  }, [currentScenarioId]);

  // useEffect für Animation
  useEffect(() => {
    // useEffect bricht ab, wenn signedRoadUrl fehlt
    if (!scenario || !signedRoadUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const carImage = new Image();
    const roadImage = new Image();

    let carY = scenario.startpointY;
    let carX = scenario.startpointX;
    // Auto zeigt nach Norden
    let carRotation = -Math.PI / 2;
    let animationFrameId: number;
    let isCleanedUp = false;

    function draw() {
      if (!canvas || !ctx || !scenario || isCleanedUp) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Straße zeichnen
      ctx.drawImage(roadImage, 0, 0, canvas.width, canvas.height);

      // Auto-Proportionen berechnen
      const targetHeight = 70;
      const imgWidth = carImage.naturalWidth || carImage.width || 1;
      const imgHeight = carImage.naturalHeight || carImage.height || 1;
      const aspectRatio = imgWidth / imgHeight;
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
      }
    }

    const loadRoad = new Promise<void>((resolve) => {
      roadImage.onload = () => resolve();
      roadImage.onerror = () =>
        console.error("Fehler beim Laden des Straßenbildes");
    });

    const loadCar = new Promise<void>((resolve) => {
      carImage.onload = () => resolve();
      carImage.onerror = () =>
        console.error("Fehler beim Laden des Autobildes");
    });

    carImage.src = selectedCar.src;

    roadImage.src = signedRoadUrl;

    Promise.all([loadRoad, loadCar]).then(() => {
      if (!isCleanedUp) {
        draw();
      }
    });

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationFrameId);
    };
    // signedRoadUrl als dependency
  }, [scenario, selectedCar, signedRoadUrl]);

  // wartet beim Laden auch auf die Bild-URL
  if (!scenario || !signedRoadUrl) {
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
      className="border border-gray-400 rounded block"
    />
  );
}
