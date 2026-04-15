import { createClient } from "@/utils/supabase/client";
import { AuthError, Session } from "@supabase/supabase-js";

export async function signInWithPassword(payload: {
  email: string;
  password: string;
}): Promise<{ session: Session | null; error: AuthError | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(payload);
  return { session: data.session, error };
}

export async function signUpWithPassword(payload: {
  email: string;
  password: string;
}) {
  const supabase = createClient();
  return supabase.auth.signUp(payload);
}

