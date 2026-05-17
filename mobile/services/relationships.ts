import { getSupabaseClient } from "@/lib/supabase";
import { Relationship } from "@/types";

export async function fetchRelationships(): Promise<Relationship[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("relationships").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as Relationship[];
}
