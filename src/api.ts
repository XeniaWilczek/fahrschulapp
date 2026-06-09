import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../Modul 14/Authentifizierung mit Supabase/src/types/database.types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

export async function fetchScenarioById(id: number) {
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
