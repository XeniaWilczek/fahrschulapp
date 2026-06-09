import { Link, Outlet } from "react-router-dom";
import { Car, LogIn, LogOut, Pencil } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuthContext } from "../context/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

export default function Root() {
  const { session, loading, signInWithGitHub, logOut } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm font-medium">Laden...</p>
      </div>
    );
  }

  return (
    <>
      <div className="banner relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen h-[10vh] bg-card border-b border-card shadow-md">
        <div className="w-full h-full flex justify-between items-center px-6">
          <div className="flex gap-2 justify-center items-center">
            <Link to="Play">
              <Button className="group flex justify-center items-center gap-2 font-bold shadow-sm">
                <Car className="size-6 text-primary-foreground transition-colors" />
                <span className="text-lg tracking-wide">Spiel starten</span>
              </Button>
            </Link>
            <Link to="Edit">
              <Button className="group flex justify-center items-center gap-2 font-bold shadow-sm">
                <Pencil className="size-6 text-primary-foreground transition-colors" />
                <span className="text-lg tracking-wide">Spiel erweitern</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!session ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="group flex justify-center items-center gap-2 font-bold shadow-sm">
                    <LogIn className="size-6 text-primary-foreground transition-colors" />
                    <span className="text-lg">Log In</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md text-center bg-popover text-popover-foreground">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-center">
                      Anmeldung
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                      Melde dich an, um vollen Zugriff auf den Fahrschul-Trainer
                      zu erhalten.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="pt-4">
                    <Button
                      onClick={signInWithGitHub}
                      className="w-full font-bold h-11 shadow text-lg"
                    >
                      Mit GitHub anmelden
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                className="group flex justify-center items-center gap-2 font-bold shadow-sm"
                onClick={logOut}
              >
                <LogOut className="size-6 text-primary-foreground transition-colors" />
                <span className="text-lg">Log Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="mt-4 w-full">
        <Outlet />
      </main>
    </>
  );
}
