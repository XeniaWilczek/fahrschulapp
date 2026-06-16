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

  return data as Scenario[];
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
    // Entfernt das Element aus dem Pool, damit es nicht doppelt gezogen werden kann
    const [pickedId] = pool.splice(randomIndex, 1);
    selectedIds.push(pickedId);
  }

  return selectedIds;
}

//Laden eines einzelnen, kompletten Szenarios
export async function fetchScenarioById(id: string): Promise<Scenario | null> {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Fehler beim Nachladen des Szenarios:", error);
    return null;
  }
  return data as Scenario;
}

export async function saveScenarioScore({
  gameId,
  scenarioId,
  score,
  userId = null,
}: {
  gameId: string;
  scenarioId: string;
  score: number;
  userId?: string | null;
}) {
  const { data, error } = await supabase
    .from("scores")
    .insert([
      {
        gameId: gameId,
        scenarioId: scenarioId,
        score: score,
        userId: userId,
      },
    ])
    .select();

  if (error) {
    console.error("Fehler beim Speichern in der scores-Tabelle:", error);
    throw error;
  }

  return data;
}
// async function insertData() {
//   const { error } = await supabase.from("Test").insert({
//     column_name: "Hallo",
//     Test_Array: ["ABC"],
//     Test_Object: { userId: "BeispielId" },
//   });
//   if (error) console.error(error);
//   fetchData();
// }

// async function deleteData() {
//   const { error } = await supabase
//     .from("Test")
//     .delete()
//     .eq("column_name", "Hallo");
//   if (error) console.error(error);
//   fetchData();
// }

// async function updateData() {
//   const { error } = await supabase
//     .from("Test")
//     .update({ column_name: "Hallodri" })

//     .eq("column_name", "Hallo");
//   if (error) console.error(error);
//   fetchData();
// }

// Daten-Fetch, sobald sich die Session ändert
// useEffect(() => {
//   if (session) {
//     fetchData();
//     fetchNtoM();
//   } else {
//     setTableData([]);
//   }
// }, [session, fetchData, fetchNtoM]);

// Daten abrufen: useCallback verhindert, dass die Funktion bei jedem Rendern neu erstellt wird
// const fetchData = useCallback(async () => {
//   const { data, error } = await supabase
//     .from("Test")
//     .select("id, column_name, created_at, Test_Array, Test_Object")
//     .eq("column_name", "Supername");

//   if (error) {
//     console.error(error);
//     return;
//   }
//   if (data) {
//     setTableData(data as unknown as TableRow[]);
//   }
// }, []);

// //relationale Abfrage
// const fetchNtoM = useCallback(async () => {
//   const { data, error } = await supabase
//     .from("Schüler")
//     .select(
//       "lastname:Nachname, course_student:Schüler_Kurs(Note, course:Kurs!Schüler_Kurs_Kursnummer_fkey(Name))",
//     );
//   console.log(data, error);
// }, []);
