import { Link, Outlet } from "react-router-dom";
import { Car, LogIn, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Root() {
  return (
    <>
      <div className="banner w-screen h-[10vh] bg-slate-800 border-b border-slate-800 shadow-md">
        <div className="w-[80vw] h-full flex justify-between items-center mx-auto">
          <Link to="/">
            <Button
              variant="ghost"
              className="group flex justify-center items-center gap-2 hover:bg-slate-800"
            >
              <Car className="size-6 text-slate-800 group-hover:text-red-500 transition-colors" />
              <span className="text-lg font-bold text-slate-800 tracking-wide">
                Fahrschul-Trainer
              </span>
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="outline"
                className="group flex justify-center items-center gap-2 border-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                <LogIn className="size-4 text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold">Log In</span>
              </Button>
            </Link>

            <Button
              className="group flex justify-center items-center gap-2 bg-amber-400 text-slate-800 hover:bg-amber-300 shadow-sm transition-all"
              onClick={() => {}}
            >
              <LogOut className="size-4 text-red-100 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-sm font-semibold">Log Out</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="mt-4 container mx-auto px-4">
        <Outlet />
      </main>
    </>
  );
}
