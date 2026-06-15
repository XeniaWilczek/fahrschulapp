import { Edit2, Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { useState, useEffect } from "react";
import type { Scenario } from "../types/ScenarioTypes";
import ScenarioDialog from "@/components/ScenarioDialog";
import { supabase, fetchAllScenarios } from "@/api";

export default function Edit() {
  // States für die Tabellendaten und die Dialogsteuerung
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  // KORREKTUR: Funktion nach draußen gezogen, damit sie überall aufrufbar ist
  async function loadScenarios() {
    const data = await fetchAllScenarios();
    setScenarios(data);
  }

  // Lädt die Daten automatisch beim allerersten Laden der Seite
  useEffect(() => {
    loadScenarios();
  }, []); // Leeres Array ist völlig korrekt, da loadScenarios global bereitsteht

  // Speichern oder Aktualisieren eines Szenarios in Supabase
  async function handleSaveScenario(data: Scenario) {
    try {
      // Das Payload-Objekt nutzt jetzt exakt deine Supabase-Schreibweise mit Unterstrichen
      const payload = {
        title: data.title,
        image_url: data.imageUrl,
        start_x: data.startpointX,
        start_y: data.startpointY,
        end_x: data.endpointX,
        end_y: data.endpointY,
        question: data.question,
        answers: data.answers,
        correct_answer: data.correctAnswer,
      };

      if (data.id) {
        // BEARBEITEN: Aktualisiert den bestehenden Datensatz in Supabase
        const { error } = await supabase
          .from("scenarios")
          .update(payload)
          .eq("id", data.id);

        if (error) throw error;
      } else {
        // NEU ANLEGEN: Erstellt einen neuen Eintrag in Supabase
        const { error } = await supabase.from("scenarios").insert([payload]);

        if (error) throw error;
      }

      // Dialog schließen, Editier-Zustand leeren und Tabelle live aktualisieren
      setIsDialogOpen(false);
      setEditingScenario(null);
      loadScenarios(); // Funktioniert jetzt fehlerfrei!
    } catch (error) {
      console.error("Fehler beim Speichern in Supabase:", error);
    }
  }

  // Öffnet den Dialog sauber im Erstellen-Modus
  function handleCreateClick() {
    setEditingScenario(null);
    setIsDialogOpen(true);
  }

  // Öffnet den Dialog im Bearbeiten-Modus mit den Zeilendaten
  function handleEditClick(scenario: Scenario) {
    setEditingScenario(scenario);
    setIsDialogOpen(true);
  }

  // Löscht ein Szenario anhand der ID aus Supabase
  async function handleDeleteScenario(id: string) {
    if (!confirm("Möchtest du dieses Szenario wirklich löschen?")) return;

    try {
      const { error } = await supabase.from("scenarios").delete().eq("id", id);

      if (error) throw error;
      loadScenarios(); // Funktioniert jetzt fehlerfrei!
    } catch (error) {
      console.error("Fehler beim Löschen des Szenarios:", error);
    }
  }
  return (
    <div className="w-full p-4 font-sans text-foreground">
      <div className="w-full">
        {/* Die Überschrift nutzt jetzt das globale Design */}
        <p className="text-left font-heading text-2xl font-bold py-4 text-foreground">
          Übersicht Szenarien:
        </p>

        <ScenarioDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveScenario}
          initialData={editingScenario}
        />

        <Button
          className="flex justify-center items-center gap-2 mb-4 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold transition-colors shadow-sm"
          onClick={handleCreateClick}
        >
          <Plus className="h-4 w-4" />
          Szenario hinzufügen
        </Button>
      </div>

      {/* overflow-x-auto schützt das Layout, text-xs/p-2 spart massiv Platz */}
      <div className="rounded-md border border-border bg-background shadow-sm overflow-x-auto w-full text-xs tracking-tight">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="p-2 font-semibold text-foreground">
                Titel
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Bild-URL
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Startpunkt-X
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Startpunkt-Y
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Endpunkt-X
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Endpunkt-Y
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground w-[15%]">
                Frage
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground w-[15%]">
                Antworten
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Richtige Antwort
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground text-center">
                Aktionen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Rendert dynamisch alle Szenarien aus deiner Supabase-Datenbank */}
            {scenarios.map((scenario) => (
              <TableRow
                key={scenario.id || Math.random()}
                className="border-border"
              >
                {/* KORREKTUR: max-w-30 wurde zu max-w-[120px] geändert, damit truncate funktioniert */}
                <TableCell
                  className="p-2 font-medium text-foreground max-w-[120px] truncate"
                  title={scenario.title}
                >
                  {scenario.title}
                </TableCell>
                {/* KORREKTUR: max-w-30 wurde zu max-w-[120px] geändert */}
                <TableCell
                  className="p-2 max-w-[120px] truncate font-mono text-muted-foreground"
                  title={scenario.imageUrl}
                >
                  {scenario.imageUrl}
                </TableCell>
                <TableCell className="p-2 font-mono text-muted-foreground">
                  {scenario.startpointX}
                </TableCell>
                <TableCell className="p-2 font-mono text-muted-foreground">
                  {scenario.startpointY}
                </TableCell>
                <TableCell className="p-2 font-mono text-muted-foreground">
                  {scenario.endpointX}
                </TableCell>
                <TableCell className="p-2 font-mono text-muted-foreground">
                  {scenario.endpointY}
                </TableCell>
                <TableCell
                  className="p-2 text-foreground max-w-[150px] truncate"
                  title={scenario.question}
                >
                  {scenario.question}
                </TableCell>
                <TableCell
                  className="p-2 text-foreground max-w-[150px] truncate"
                  title={
                    Array.isArray(scenario.answers)
                      ? scenario.answers.join(", ")
                      : ""
                  }
                >
                  {Array.isArray(scenario.answers)
                    ? scenario.answers.join(", ")
                    : ""}
                </TableCell>
                <TableCell
                  className="p-2 text-foreground max-w-[120px] truncate"
                  title={scenario.correctAnswer}
                >
                  {scenario.correctAnswer}
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex justify-center items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-amber-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      title="Vorschau"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* Ruft die Bearbeiten-Funktion auf und lädt die Daten in den Dialog */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Bearbeiten"
                      onClick={() => handleEditClick(scenario)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {/* Löscht den Eintrag direkt über die Supabase-ID */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Löschen"
                      onClick={() =>
                        scenario.id && handleDeleteScenario(scenario.id)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Falls noch gar keine Daten vorhanden sind */}
            {scenarios.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="p-4 text-center text-muted-foreground"
                >
                  Noch keine Szenarien vorhanden. Klicke auf "Szenario
                  hinzufügen", um eins zu erstellen.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
