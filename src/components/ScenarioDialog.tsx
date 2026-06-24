import type { Tables, TablesInsert } from "../types/database.types";
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
import { Plus, X } from "lucide-react";

interface ScenarioDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Scenario) => void;
  initialData?: Scenario | null;
}

// Initialer Zustand ausgelagert

const INITIAL_SCENARIO_DATA: Partial<TablesInsert<"scenarios">> = {
  title: "",
  imageUrl: "",
  startpointX: 0,
  startpointY: 0,
  endpointX: 0,
  endpointY: 0,
  question: "",
  answers: [""],
  correctAnswer: "",
};

// Hilfsfunktion für Kopie
const getInitialData = (): Partial<TablesInsert<"scenarios">> => ({
  ...INITIAL_SCENARIO_DATA,
  answers: [""],
});

export default function ScenarioDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
}: ScenarioDialogProps) {
  // Formular-State nutzt Supabase-Typen
  const [formData, setFormData] =
    useState<Partial<Tables<"scenarios">>>(getInitialData());
  // Referenz auf Datei-Upload-Input: Bilddatei beim Absenden direkt auslesen, ohne Rendering bei jeder Änderung unnötig auszulösen
  const fileInput = useRef<HTMLInputElement | null>(null);

  // Zeigt vorhandene Daten an (Bearbeiten-Modus) oder leert Input-Felder (Erstellen-Modus)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        answers:
          Array.isArray(initialData.answers) && initialData.answers.length > 0
            ? initialData.answers
            : [""],
      });
    } else {
      setFormData(getInitialData());
    }
  }, [initialData, isOpen]);

  // Universelle Funktion für Text- und Nummer-Eingaben
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setFormData(function (prev) {
      return {
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      };
    });
  }

  // Ändert den Text einer bestimmten Antwort im Array basierend auf dem Index
  function handleAnswerChange(index: number, value: string) {
    setFormData(function (prev) {
      const updatedAnswers = [...(prev.answers || [])];
      updatedAnswers[index] = value;
      return {
        ...prev,
        answers: updatedAnswers,
      };
    });
  }

  // Hinzufügen eines Antwortfeld hinzu
  function addAnswerField() {
    setFormData(function (prev) {
      return {
        ...prev,
        answers: [...(prev.answers || []), ""],
      };
    });
  }

  // Löschen eines Antwortfeld basierend auf dem Index
  function removeAnswerField(index: number) {
    setFormData(function (prev) {
      const updatedAnswers = (prev.answers || []).filter((_, i) => i !== index);
      return {
        ...prev,
        answers: updatedAnswers.length > 0 ? updatedAnswers : [""],
      };
    });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const file = fileInput.current?.files?.[0];
    let imagePath = formData.imageUrl;

    if (file) {
      const imageResult = await uploadFile(file);
      if (imageResult?.path) {
        imagePath = imageResult.path;
      } else {
        alert("Fehler beim Hochladen des Bildes.");
        return;
      }
    }

    const cleanAnswers = (formData.answers || [])
      .map((answer) => answer.trim())
      .filter((answer) => answer !== "");

    // Wir erstellen ein exaktes Objekt vom Typ Tables<"scenarios">.
    // Durch die Fallbacks weiß TypeScript, dass kein Wert mehr undefined sein kann.
    const finalData: Tables<"scenarios"> = {
      id: formData.id || "", // Behält die ID beim Update oder übergibt einen leeren String (wird von Supabase beim Insert generiert)
      title: formData.title?.trim() || "",
      question: formData.question?.trim() || "",
      correctAnswer: formData.correctAnswer?.trim() || "",
      answers: cleanAnswers,
      imageUrl: imagePath ?? "",
      startpointX: formData.startpointX ?? 0,
      startpointY: formData.startpointY ?? 0,
      endpointX: formData.endpointX ?? 0,
      endpointY: formData.endpointY ?? 0,
    };

    onSave(finalData);

    // States nach dem Speichern sauber zurücksetzen
    setFormData(getInitialData());
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
            />
            {/* Zeigt im Bearbeiten-Modus den aktuellen Status an */}
            {formData.imageUrl && (
              <p className="mt-1 text-xs text-muted-foreground">
                Aktuell verknüpft:{" "}
                <span className="font-mono text-foreground">
                  {formData.imageUrl.split("/").pop()}
                </span>
              </p>
            )}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground/90">
                Antwortmöglichkeiten:
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswerField}
                className="h-8 px-2 text-xs flex items-center gap-1 border-dashed"
              >
                <Plus className="h-4 w-4" /> Antwort hinzufügen
              </Button>
            </div>

            <div className="space-y-2 max-h-50 overflow-y-auto pr-1">
              {(formData.answers || []).map((answer, index) => (
                <div
                  key={`answer-${index}`}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder={`Antwort ${index + 1} eingeben`}
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    required
                    className="placeholder:font-normal text-base flex-1"
                  />
                  {(formData.answers || []).length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAnswerField(index)}
                      className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white"
                      title="Antwort entfernen"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

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
