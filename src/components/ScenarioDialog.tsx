import { useEffect, useState } from "react";
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

// WICHTIG: Importiert den zentralen Typen direkt aus deiner API-Datei

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
  // Separater Text-State für das Antworten-Feld (Komma-Trennung für den Nutzer)
  const [answersInput, setAnswersInput] = useState("");

  // Der Formular-State basiert auf dem echten Supabase-Datenbank-Typen
  // Partial<Scenario> erlaubt es, dass die 'id' beim Erstellen eines neuen Szenarios noch fehlt
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

  // Synchronisiert das Formular mit vorhandenen Daten (Bearbeiten-Modus) oder leert es (Erstellen-Modus)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setAnswersInput(
        Array.isArray(initialData.answers)
          ? initialData.answers.join(", ")
          : "",
      );
    } else {
      // Setzt das Formular zurück auf Standardwerte beim Erstellen-Modus
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

  // Universelle Funktion für Text- und Nummern-Eingaben
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setFormData(function (prev) {
      return {
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      };
    });
  }

  // Absenden des Formulars
  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    // Verarbeitet den getippten Komma-Text zu einem echten Array
    const answersArray = answersInput
      .split(",")
      .map((answer) => answer.trim())
      .filter((answer) => answer !== "");

    // Erstellt das finale Objekt exakt im Supabase-Format
    const finalData: Scenario = {
      ...formData,
      answers: answersArray,
    } as Scenario; // Sichere Typumwandlung, da die übergeordnete Funktion die ID beim Update liest oder Supabase sie beim Einfügen generiert

    onSave(finalData);

    // States nach dem Speichern zurücksetzen
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
              Bild-URL:
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="Bild-URL eingeben"
              type="text"
              value={formData.imageUrl || ""}
              onChange={handleChange}
              className="placeholder:font-normal text-base"
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
