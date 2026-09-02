import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database.types";
import type { Scenario } from "./types/ScenarioTypes";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

//Laden aller Szenario-Objekte in ein Array für Listen-Ansicht
export async function fetchAllScenarios(): Promise<Scenario[]> {
  const { data, error } = await supabase.from("scenarios").select("*");

  if (error) {
    console.error("Fehler beim Laden der Szenarien aus der DB:", error);
    return [];
  }

  return data || [];
}

//Laden aller SzenarioIds für das Spiel
export async function fetchAllScenarioIds(): Promise<string[]> {
  const { data, error } = await supabase.from("scenarios").select("id");

  if (error) {
    console.error("Fehler beim Laden der IDs aus der DB:", error);
    return [];
  }

  // Transformiert [{id: "uuid1"}, {id: "uuid2"}] zu ["uuid1", "uuid2"]
  return data.map((item) => item.id);
}

// 5 zufällige Ids aus einem übergebenen Gesamt-Array laden
export function pickFiveRandomIds(allIds: string[]): string[] {
  // Kopie des Gesamt-Arrays erstellen, um das Original nicht zu verändern
  const pool = [...allIds];
  const selectedIds: string[] = [];

  // Maximal 5 Runden in einem Spiel
  const totalRounds = Math.min(5, pool.length);

  for (let i = 0; i < totalRounds; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    // Entfernt das Element aus dem Pool, damit es nicht doppelt gezogen werden kann -->gilt nur für eine Spielrunde
    const [pickedId] = pool.splice(randomIndex, 1);
    selectedIds.push(pickedId);
  }

  return selectedIds;
}

//Laden eines einzelnen Szenario-Objekts
export async function fetchScenarioById(id: string): Promise<Scenario | null> {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fehler beim Laden des Szenarios:", error);
    return null;
  }
  return data;
}

export async function saveScenarioScore({
  gameId,
  scenarioId,
  score,
  userId,
}: {
  gameId: string;
  scenarioId: string;
  score: number;
  userId: string;
}) {
  // .select() angehängt, damit das Objekt auch wirklich zurückgegeben wird
  const { data, error } = await supabase
    .from("scores")
    .insert([{ gameId, scenarioId, score, userId }])
    .select();

  if (error) {
    console.error("Fehler beim Speichern in der scores-Tabelle:", error);
    throw error;
  }

  return data;
}

export async function uploadFile(file: File, oldFilePath?: string | null) {
  // wenn  alter Bildpfad exisitert, diese Datei aus dem Storage löschen
  if (oldFilePath) {
    const cleanOldPath = oldFilePath.includes("/")
      ? oldFilePath.split("/").pop()
      : oldFilePath;
    if (cleanOldPath) {
      const { error: deleteError } = await supabase.storage
        .from("backgrounds")
        .remove([cleanOldPath]);

      if (deleteError) {
        console.error(
          "Fehler beim Löschen des alten Bildes vor dem Upload:",
          deleteError.message,
        );
      }
    }
  }

  // neues Bild hochladen (upsert: true überschreibt bei identischem Namen)
  const { data, error } = await supabase.storage
    .from("backgrounds")
    .upload(file.name, file, { upsert: true });

  if (error) {
    console.error("Fehler beim Upload in Supabase Storage:", error.message);
    return null;
  }
  return data;
}

export async function getSignedUrl(
  filePath: string,
  expiresInSeconds: number = 3600,
): Promise<string | null> {
  const cleanPath = filePath.includes("/")
    ? filePath.split("/").pop()!
    : filePath;

  const { data, error } = await supabase.storage
    .from("backgrounds")
    .createSignedUrl(cleanPath, expiresInSeconds);

  if (error) {
    console.error("Fehler beim Erstellen der Signed URL:", error.message);
    return null;
  }

  // gibt fertige, temporäre URL für Canvas/Bild-Tag zurück
  return data.signedUrl;
}

export async function saveScenario(
  data: Omit<Scenario, "id"> & { id?: string },
): Promise<void> {
  const payload = {
    title: data.title,
    imageUrl: data.imageUrl,
    startpointX: data.startpointX,
    startpointY: data.startpointY,
    endpointX: data.endpointX,
    endpointY: data.endpointY,
    question: data.question,
    answers: data.answers,
    correctAnswer: data.correctAnswer,
  };

  if (data.id) {
    // Aktualisiert bestehenden Datensatz (Bearbeiten-Modus)
    const { error } = await supabase
      .from("scenarios")
      .update(payload)
      .eq("id", data.id);

    if (error) throw error;
  } else {
    // Erstellt neuen Eintrag in Supabase (Erstellen-Modus)
    const { error } = await supabase.from("scenarios").insert([payload]);

    if (error) throw error;
  }
}

// Szenario anhand der ID aus der Datenbank löschen
export async function deleteScenario(id: string): Promise<void> {
  // 1. Bildpfad aus der Datenbank holen
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("imageUrl")
    .eq("id", id)
    .single();

  // 2. Bild aus dem "backgrounds"-Ordner löschen
  if (scenario?.imageUrl) {
    const fileName = scenario.imageUrl.split("/").pop();
    if (fileName) {
      await deleteFile(fileName);
    }
  }

  // 3. Erst danach das Szenario aus der Tabelle löschen
  const { error } = await supabase.from("scenarios").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteFile(filePath: string) {
  if (!filePath) return;
  try {
    const cleanPath = filePath.includes("/")
      ? filePath.split("/").pop()!
      : filePath;
    const { error } = await supabase.storage
      .from("backgrounds")
      .remove([cleanPath]);

    if (error) console.error("Storage-Fehler beim Löschen:", error.message);
  } catch (err) {
    console.error("Storage-Löschfehler:", err);
  }
}
