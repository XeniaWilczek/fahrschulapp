import { supabase } from "@/api";

//Authentication: LogIn
async function signInWithGitHub() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
  });
  if (error) console.error(error);
}
//Authentication: LogOut
async function logOut() {
  await supabase.auth.signOut();
}
