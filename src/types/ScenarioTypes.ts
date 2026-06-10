import type { Database } from "./database.types";

// interface ScenarioProps {
//   id: string;
//   title: string;
//   imageUrl: string;
//   startpointX: number;
//   startpointY: number;
//   endpointX: number;
//   endpointY: number;
//   question: string;
//   answers: string[];
//   correctAnswer: string;
// }
export type Scenario = Database["public"]["Tables"]["scenarios"]["Row"];
