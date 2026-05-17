import { getSupabaseClient } from "@/lib/supabase";
import { Gender, Person } from "@/types";
import { Database } from "@/types/database.types";

export interface PersonWritePayload {
  full_name: string;
  gender: Gender;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  death_year: number | null;
  death_month: number | null;
  death_day: number | null;
  death_lunar_year: number | null;
  death_lunar_month: number | null;
  death_lunar_day: number | null;
  is_deceased: boolean;
  is_in_law: boolean;
  birth_order: number | null;
  generation: number | null;
  other_names: string | null;
  avatar_url: string | null;
  note: string | null;
}

type PersonInsert = Database["public"]["Tables"]["persons"]["Insert"];
type PersonUpdate = Database["public"]["Tables"]["persons"]["Update"];

const EVENTS_PERSON_SELECT =
  "id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, death_lunar_year, death_lunar_month, death_lunar_day, is_deceased, avatar_url, generation";

export async function fetchPersonsForEvents(): Promise<Person[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("persons")
    .select(EVENTS_PERSON_SELECT)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Person[];
}

export async function fetchPersonsList(): Promise<Person[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .order("birth_year", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Person[];
}

export async function fetchPersonById(id: string): Promise<Person | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Person | null;
}

export async function createPerson(
  payload: PersonWritePayload,
): Promise<Person> {
  const supabase = getSupabaseClient();
  const insertPayload: PersonInsert = { ...payload };
  const personsTable = supabase.from("persons") as unknown as {
    insert: (values: PersonInsert) => {
      select: (query: string) => {
        single: () => Promise<{
          data: Person | null;
          error: { message: string } | null;
        }>;
      };
    };
  };

  const { data, error } = await personsTable
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Không tạo được thành viên.");
  }
  return data;
}

export async function updatePerson(
  personId: string,
  payload: Partial<PersonWritePayload>,
): Promise<void> {
  const supabase = getSupabaseClient();
  const updatePayload: PersonUpdate = { ...payload };
  const personsTable = supabase.from("persons") as unknown as {
    update: (values: PersonUpdate) => {
      eq: (
        column: "id",
        value: string,
      ) => Promise<{ error: { message: string } | null }>;
    };
  };

  const { error } = await personsTable.update(updatePayload).eq("id", personId);
  if (error) throw new Error(error.message);
}

export async function deletePerson(personId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("persons").delete().eq("id", personId);
  if (error) throw new Error(error.message);
}
