import { createClient } from "@supabase/supabase-js";

import "./App.css";
import type { Database } from "./types/database.types";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import Root from "./routes/Root";
import Rules from "./components/Rules";
import Play from "./routes/Play";
import Edit from "./routes/Edit";

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

function App() {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Rules /> },
          { path: "play", element: <Play /> },
          { path: "edit", element: <Edit /> },
        ],
      },
    ],
    {
      basename: "/User-Uebersicht",
    },
  );

  return (
    <UserContext.Provider value={{ users, dispatch }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;
