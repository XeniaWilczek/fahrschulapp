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
import {
  fetchAllScenarios,
  saveScenario,
  deleteScenario as apiDeleteScenario,
} from "@/api";
import PreviewDialog from "@/components/PreviewDialog";

export default function Edit() {
  // States für die Tabellendaten und die Dialogsteuerung
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewScenarioId, setPreviewScenarioId] = useState<string | null>(
    null,
  );

  async function loadScenarios() {
    const data = await fetchAllScenarios();
    setScenarios(data);
  }

  // Lädt Daten beim initialen Laden der Seite
  useEffect(() => {
    loadScenarios();
  }, []);

  // Speichern oder Aktualisieren eines Szenarios über die API
  async function handleSaveScenario(data: Scenario) {
    try {
      await saveScenario(data);

      // Dialog schließen, Editier-Zustand leeren und Tabelle aktualisieren
      setIsDialogOpen(false);
      setEditingScenario(null);
      loadScenarios();
    } catch (error) {
      console.error("Fehler beim Speichern in Supabase:", error);
    }
  }

  // Öffnet Dialog im Erstellen-Modus
  function handleCreateClick() {
    setEditingScenario(null);
    setIsDialogOpen(true);
  }

  // Öffnet Dialog im Bearbeiten-Modus mit den Daten
  function handleEditClick(scenario: Scenario) {
    setEditingScenario(scenario);
    setIsDialogOpen(true);
  }

  // Löscht ein Szenario anhand der ID
  async function handleDeleteScenario(id: string) {
    if (!confirm("Möchtest du dieses Szenario wirklich löschen?")) return;

    try {
      await apiDeleteScenario(id);
      loadScenarios();
    } catch (error) {
      console.error("Fehler beim Löschen des Szenarios:", error);
    }
  }

  function handlePreviewClick(id: string) {
    setPreviewScenarioId(id);
    setIsPreviewOpen(true);
  }

  return (
    <div className="w-full p-4 font-sans text-foreground">
      <div className="w-full">
        <p className="text-left font-heading text-2xl font-bold py-4 text-foreground">
          Übersicht Szenarien:
        </p>

        <ScenarioDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveScenario}
          initialData={editingScenario}
        />
        <PreviewDialog
          isOpen={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          currentScenarioId={previewScenarioId}
        />
        <Button
          className="flex justify-center items-center gap-2 mb-4 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold transition-colors shadow-sm"
          onClick={handleCreateClick}
        >
          <Plus className="h-4 w-4" />
          Szenario hinzufügen
        </Button>
      </div>

      <div className="rounded-md border border-border bg-background shadow-sm overflow-x-auto w-full text-xs tracking-tight">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="p-2 font-semibold text-foreground">
                Titel
              </TableHead>
              <TableHead className="p-2 font-semibold text-foreground">
                Bild-Datei
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
            {scenarios.map((scenario) => (
              <TableRow
                key={scenario.id || Math.random()}
                className="border-border"
              >
                <TableCell
                  className="p-2 font-medium text-foreground max-w-30 truncate"
                  title={scenario.title}
                >
                  {scenario.title}
                </TableCell>
                <TableCell
                  className="p-2 max-w-30 truncate font-mono text-muted-foreground"
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
                  className="p-2 text-foreground max-w-37.5 truncate"
                  title={scenario.question}
                >
                  {scenario.question}
                </TableCell>
                <TableCell
                  className="p-2 text-foreground max-w-37.5 truncate"
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
                  className="p-2 text-foreground max-w-30 truncate"
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
                      onClick={() =>
                        scenario.id && handlePreviewClick(scenario.id)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      title="Bearbeiten"
                      onClick={() => handleEditClick(scenario)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
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
