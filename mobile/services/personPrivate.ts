import { getSupabaseClient } from "@/lib/supabase";
import { Database } from "@/types/database.types";

export interface PersonPrivateDetails {
  person_id: string;
  phone_number: string | null;
  occupation: string | null;
  current_residence: string | null;
}

type PersonPrivateInsert =
  Database["public"]["Tables"]["person_details_private"]["Insert"];

export async function fetchPersonPrivateDetails(
  personId: string,
): Promise<PersonPrivateDetails | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("person_details_private")
    .select("*")
    .eq("person_id", personId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as PersonPrivateDetails | null;
}

export async function upsertPersonPrivateDetails(
  payload: PersonPrivateDetails,
): Promise<void> {
  const supabase = getSupabaseClient();
  const upsertPayload: PersonPrivateInsert = { ...payload };
  const table = supabase.from("person_details_private") as unknown as {
    upsert: (
      values: PersonPrivateInsert,
    ) => Promise<{ error: { message: string } | null }>;
  };
  const { error } = await table.upsert(upsertPayload);
  if (error) throw new Error(error.message);
}

export async function deletePersonPrivateDetails(
  personId: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("person_details_private")
    .delete()
    .eq("person_id", personId);

  if (error) throw new Error(error.message);
}
