import { useEffect, useRef, useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Field } from "../components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "./ui/button";
import type { Scenario } from "../types/ScenarioTypes";
import { uploadFile } from "@/api";

interface ScenarioDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Scenario) => void;
  initialData?: Scenario | null;
}

export default function ScenarioDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
}: ScenarioDialogProps) {
  // Separater State für das Antworten-Feld (Komma-Trennung für den Nutzer)
  const [answersInput, setAnswersInput] = useState("");

  // Der Formular-State basiert auf dem Supabase-Typen "Scenario"
  // Partial<Scenario> erlaubt es, dass die id beim Erstellen eines neuen Szenarios fehlt (id kommt von Supabase)
  const [formData, setFormData] = useState<Partial<Scenario>>({
    title: "",
    imageUrl: "",
    startpointX: 0,
    startpointY: 0,
    endpointX: 0,
    endpointY: 0,
    question: "",
    answers: [],
    correctAnswer: "",
  });
  const fileInput = useRef<HTMLInputElement | null>(null);

  // Zeigt vorhandene Daten an (Bearbeiten-Modus) oder leert die Felder (Erstellen-Modus)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setAnswersInput(
        Array.isArray(initialData.answers)
          ? initialData.answers.join(", ")
          : "",
      );
    } else {
      setFormData({
        title: "",
        imageUrl: "",
        startpointX: 0,
        startpointY: 0,
        endpointX: 0,
        endpointY: 0,
        question: "",
        answers: [],
        correctAnswer: "",
      });
      setAnswersInput("");
    }
  }, [initialData, isOpen]);

  // Universelle Funktion für Text- und Nummer-Eingaben
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setFormData(function (prev) {
      return {
        ...prev,
        [name]: type === "number" ? Number(value) : value, //Input-Eingaben sind immmer Strings
      };
    });
  }

  // Absenden des Formulars
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1. Prüfen, ob eine Datei im Input ausgewählt wurde
    const file = fileInput.current?.files?.[0];
    let imagePath = formData.imageUrl; // Standardmäßig den alten Pfad behalten (wichtig für den Bearbeiten-Modus)

    if (file) {
      const imageResult = await uploadFile(file);
      if (imageResult?.path) {
        imagePath = imageResult.path; // Holt den sauberen Pfad-String aus dem zurückgegebenen 'data'-Objekt
      } else {
        alert("Fehler beim Hochladen des Bildes.");
        return;
      }
    }

    // Verarbeitet den getippten Text mit Kommas zu echtem Array
    const answersArray = answersInput
      .split(",")
      .map((answer) => answer.trim())
      .filter((answer) => answer !== "");

    // Erstellt Objekt für Supabase-Array
    const finalData: Scenario = {
      ...formData,
      answers: answersArray,
      imageUrl: imagePath ?? "", // Speichert den Pfad-String (z.B. "backgrounds/name.png0.123") in der DB
    } as Scenario;

    onSave(finalData);

    // States nach dem Speichern zurücksetzen (Dein bestehender Reset-Code...)
    setAnswersInput("");
    setFormData({
      title: "",
      imageUrl: "",
      startpointX: 0,
      startpointY: 0,
      endpointX: 0,
      endpointY: 0,
      question: "",
      answers: [],
      correctAnswer: "",
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-background text-foreground border border-border p-5 shadow-lg font-sans">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-xl text-foreground text-left">
            {initialData
              ? "Szenario bearbeiten:"
              : "Gib die Daten für Szenario ein:"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-left">
          <Field>
            <Label
              htmlFor="title"
              className="text-sm font-semibold text-foreground/90"
            >
              Titel:
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Titel eingeben"
              type="text"
              value={formData.title || ""}
              onChange={handleChange}
              className="placeholder:font-normal text-base"
            />
          </Field>

          <Field>
            <Label
              htmlFor="imageUrl"
              className="text-sm font-semibold text-foreground/90"
            >
              Hintergrundbild hochladen:
            </Label>
            <Input
              id="imageUrl"
              ref={fileInput} // Behält deine Referenz, um die Datei in handleSubmit auszulesen
              type="file"
              accept="image/*" // Erlaubt dem Nutzer nur die Auswahl von Bildern
              className="text-base cursor-pointer"
              // Kein 'name', kein 'value' und kein 'onChange={handleChange}' für diesen Datei-Input!
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <Label
                htmlFor="startpointX"
                className="text-sm font-semibold text-foreground/90"
              >
                Startpunkt-X:
              </Label>
              <Input
                id="startpointX"
                name="startpointX"
                placeholder="0"
                type="number"
                value={formData.startpointX ?? 0}
                onChange={handleChange}
                className="placeholder:font-normal text-base font-mono"
              />
            </Field>
            <Field>
              <Label
                htmlFor="startpointY"
                className="text-sm font-semibold text-foreground/90"
              >
                Startpunkt-Y:
              </Label>
              <Input
                id="startpointY"
                name="startpointY"
                placeholder="0"
                type="number"
                value={formData.startpointY ?? 0}
                onChange={handleChange}
                className="placeholder:font-normal text-base font-mono"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field>
              <Label
                htmlFor="endpointX"
                className="text-sm font-semibold text-foreground/90"
              >
                Endpunkt-X:
              </Label>
              <Input
                id="endpointX"
                name="endpointX"
                placeholder="0"
                type="number"
                value={formData.endpointX ?? 0}
                onChange={handleChange}
                className="placeholder:font-normal text-base font-mono"
              />
            </Field>
            <Field>
              <Label
                htmlFor="endpointY"
                className="text-sm font-semibold text-foreground/90"
              >
                Endpunkt-Y:
              </Label>
              <Input
                id="endpointY"
                name="endpointY"
                placeholder="0"
                type="number"
                value={formData.endpointY ?? 0}
                onChange={handleChange}
                className="placeholder:font-normal text-base font-mono"
              />
            </Field>
          </div>

          <Field>
            <Label
              htmlFor="question"
              className="text-sm font-semibold text-foreground/90"
            >
              Frage:
            </Label>
            <Input
              id="question"
              name="question"
              placeholder="Frage eingeben"
              type="text"
              value={formData.question || ""}
              onChange={handleChange}
              className="placeholder:font-normal text-base"
            />
          </Field>

          <Field>
            <Label
              htmlFor="answers"
              className="text-sm font-semibold text-foreground/90"
            >
              Antworten (mit Komma trennen):
            </Label>
            <Input
              id="answers"
              name="answers"
              placeholder="Antwort 1, Antwort 2, Antwort 3"
              type="text"
              value={answersInput}
              onChange={function (e) {
                setAnswersInput(e.target.value);
              }}
              className="placeholder:font-normal text-base"
            />
          </Field>

          <Field>
            <Label
              htmlFor="correctAnswer"
              className="text-sm font-semibold text-foreground/90"
            >
              richtige Antwort:
            </Label>
            <Input
              id="correctAnswer"
              name="correctAnswer"
              placeholder="richtige Antwort eingeben"
              type="text"
              value={formData.correctAnswer || ""}
              onChange={handleChange}
              className="placeholder:font-normal text-base"
            />
          </Field>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold shadow-sm transition-colors"
            >
              Speichern
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
