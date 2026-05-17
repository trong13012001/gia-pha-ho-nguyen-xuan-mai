import { getSupabaseClient } from "@/lib/supabase";
import { Profile } from "@/types";

export async function fetchProfileByUserId(
  userId: string,
): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Profile | null) ?? null;
}

export function canEditMembers(role: Profile["role"] | undefined): boolean {
  return role === "admin" || role === "editor";
}
