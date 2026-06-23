import { supabase } from "@/api";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logOut: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      console.log(currentSession);
    });
    console.log("mountAuth");
    return () => {
      subscription.unsubscribe();
      console.log("unmountAuth");
    };
  }, []);

  async function signInWithGitHub() {
    // Baut die URL exakt auf die Startseite von GitHub Pages
    const redirectToUrl = `${window.location.origin}/fahrschulapp/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectToUrl,
      },
    });
    if (error) console.error("GitHub Login Fehler:", error.message);
  }

  async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout Fehler:", error.message);
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, logOut, signInWithGitHub }}
    >
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          Lade Spieldaten...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext muss innerhalb von AuthProvider verwendet werden",
    );
  }
  return context;
}
