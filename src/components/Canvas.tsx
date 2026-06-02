import car from "../assets/car.svg";
import road from "../assets/road.jpg";

import { useRef, useEffect } from "react";

export default function CanvasCarAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const carImage = new Image();
    const roadImage = new Image();

    carImage.src = car;
    roadImage.src = road;

    // Startpositionen
    let carY = canvas.height + 60;

    // KORREKTUR: Auf Pixelwert 255 gesetzt, damit das Auto mittig auf der Spur fährt
    let carX = 255;

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
      if (carY > 100) {
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={500}
      className="border border-gray-400 rounded"
    />
  );
}
