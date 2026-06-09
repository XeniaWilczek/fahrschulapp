import type { CarModelProps } from "../routes/Play";
import { fetchScenarioById } from "../api";

import { useRef, useEffect, useState } from "react";
//state von car eindügen, damit es benutzt werden kann?
interface ScenarioProps {
  id: string;
  title: string;
  imageUrl: string;
  startpointX: number;
  startpointY: number;
  endpointX: number;
  endpointY: number;
  question: string;
  answers: string[];
  correctAnswer: string;
}

export default function CanvasCarAnimation({
  selectedCar,
}: {
  selectedCar: CarModelProps | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scenario, setScenario] = useState<ScenarioProps | null>(null);

  // Separater Hook für das Fetchen der Daten von Supabase
  useEffect(() => {
    // Beispiel-Id -->später dynamisch
    fetchScenarioById(1).then((data: ScenarioProps | null) => {
      if (data) {
        setScenario(data);
      }
    });
  }, []);

  // Separater Hook für Canvas-Animation mit bestimmtem Szenario und bestimmtem Auto
  useEffect(() => {
    if (!scenario || !selectedCar) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const carImage = new Image();
    const roadImage = new Image();

    carImage.src = car;
    roadImage.src = road;

    // Startpositionen
    //let carY = canvas.height + 60;

    // Pixelwert 255, damit das Auto mittig auf der Spur fährt
    //let carX = 255;

    let carY = scenario.startpointY;
    let carX = scenario.startpointX;

    let carRotation = -Math.PI / 2;

    let animationFrameId: number;

    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Straße zeichnen
      ctx.drawImage(roadImage, 0, 0, canvas.width, canvas.height);

      // 2. Proportionale Maße berechnen
      const targetWidth = 50;
      const aspectRatio = carImage.naturalWidth / carImage.naturalHeight;
      const targetHeight = targetWidth * aspectRatio;

      // 3. Canvas für die Drehung vorbereiten
      ctx.save();
      ctx.translate(carX, carY);

      ctx.rotate(carRotation);
      console.log(carX, carY);
      // 4. Auto zentriert zeichnen
      ctx.drawImage(
        carImage,
        -targetHeight / 2,
        -targetWidth / 2,
        targetHeight,
        targetWidth,
      );

      ctx.restore();

      // 5. Bewegung nach Norden
      carY -= 2;

      //Reset
      if (carY > scenario.endpointY) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    const loadRoad = new Promise((resolve) => {
      roadImage.onload = resolve;
      roadImage.onerror = () => console.error("Fehler beim Laden von road.png");
    });

    const loadCar = new Promise((resolve) => {
      carImage.onload = resolve;
      carImage.onerror = () => console.error("Fehler beim Laden von car.svg");
    });

    Promise.all([loadRoad, loadCar]).then(() => {
      draw();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scenario, selectedCar]);

  if (!scenario) {
    return <div className="text-center p-4">Szenario wird geladen...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={500}
      className="border border-gray-400 rounded"
    />
  );
}
