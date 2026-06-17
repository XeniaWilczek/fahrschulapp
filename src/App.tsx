import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ErrorPage from "./components/ErrorPage";
import Root from "./routes/Root";
import Rules from "./components/Rules";
import Play from "./routes/Play";
import Edit from "./routes/Edit";

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
