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
import miniCooperImg from "../assets/MiniCooperC.png";
import { MoveRight } from "lucide-react";
import { Button } from "../components/ui/button";
import CanvasCarAnimation from "../components/Canvas";

export interface CarModelProps {
  id: number;
  title: string;
  src: string;
  alt: string;
}

export default function Play() {
  const carModels: CarModelProps[] = [
    {
      id: 1,
      title: "Ford Focus",
      src: fordFocusImg,
      alt: "Rotes Auto",
    },

    {
      id: 2,
      title: "VW Tiguan",
      src: vwTiguanImg,
      alt: "Blaues Auto",
    },
    {
      id: 3,
      title: "Porsche 911",
      src: porsche911Img,
      alt: "Gelbes Auto",
    },
    {
      id: 4,
      title: "Mini Cooper C",
      src: miniCooperImg,
      alt: "Grünes Auto",
    },
  ];
  const [isOpen, setIsOpen] = useState(true);
  const [carModel, setCarModel] = useState<CarModelProps | null>(null);

  function handleSelectCar(id: number): void {
    const selectedCar = carModels.find((car) => car.id === id);
    if (selectedCar) {
      setCarModel(selectedCar);
    }
    setIsOpen(false);
  }

  return (
    <div className="w-full">
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
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <div className="w-[60vw] flex flex-col justify-center items-center gap-2">
        <p className="text-lg">
          Punkte: <span className="text-lg font-bold text-amber-400">0</span>
        </p>
        <div className="w-[40vw] sm:w-[18vw] aspect-9/16 rounded-md shadow-md">
          <CanvasCarAnimation selectedCar={carModel}></CanvasCarAnimation>
        </div>
        <Button className="text-lg">
          <MoveRight className="size-6 text-primary-foreground transition-colors"></MoveRight>
          <span>Weiter</span>
        </Button>
      </div>
    </div>
  );
}
