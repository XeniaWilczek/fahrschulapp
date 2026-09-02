import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthProvider, { useAuthContext } from "./context/AuthProvider";
import ErrorPage from "./components/ErrorPage";
import Root from "./routes/Root";
import Rules from "./components/Rules";
import Play from "./routes/Play";
import Edit from "./routes/Edit";
import { Button } from "./components/ui/button";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, signInWithGitHub } = useAuthContext();

  // Wenn kein User eingeloggt ist, wird der Login-Screen angezeigt
  if (!user) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold">Anmeldung erforderlich</h1>
        <p className="text-muted-foreground max-w-sm">
          Du musst mit GitHub angemeldet sein, um das Spiel spielen und
          bearbeiten zu können.
        </p>
        <Button onClick={signInWithGitHub} className="mt-2">
          Mit GitHub anmelden
        </Button>
      </div>
    );
  }

  // Wenn ein User eingeloggt ist, wird der eigentliche Inhalt der Route angezeigt
  return children;
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Rules /> },
        {
          path: "play",
          element: (
            <ProtectedRoute>
              <Play />
            </ProtectedRoute>
          ),
        },
        {
          path: "edit",
          element: (
            <ProtectedRoute>
              <Edit />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
  {
    // Lokal (DEV-Modus) wird "/" genutzt, auf dem Server wird "/fahrschulapp" genutzt
    basename: "/fahrschulapp",
  },
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
