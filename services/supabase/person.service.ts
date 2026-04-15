import { Person } from "@/types";
import { Database } from "@/types/database.types";
import {
  getServiceSupabaseClient,
  withServiceErrorHandling,
} from "./base.service";

export interface PersonPrivateDetails {
  person_id: string;
  phone_number: string | null;
  occupation: string | null;
  current_residence: string | null;
}

export interface PersonWritePayload {
  full_name: string;
  gender: Person["gender"];
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

export interface PersonQuickCreatePayload {
  full_name: string;
  gender: Person["gender"];
  birth_year?: number;
  birth_order?: number;
  is_in_law?: boolean;
  generation?: number;
  note?: string | null;
}

export interface PersonListQueryOptions {
  select?: string;
  includeOrderByBirthYear?: boolean;
}

const PERSONS_ORDER_COLUMN = "birth_year";
type PersonInsert = Database["public"]["Tables"]["persons"]["Insert"];
type PersonUpdate = Database["public"]["Tables"]["persons"]["Update"];
type PersonPrivateDetailsInsert =
  Database["public"]["Tables"]["person_details_private"]["Insert"];

export async function listPersons(
  options?: PersonListQueryOptions,
): Promise<Person[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const query = supabase.from("persons").select(options?.select ?? "*");
    const orderedQuery = options?.includeOrderByBirthYear
      ? query.order(PERSONS_ORDER_COLUMN, { ascending: true, nullsFirst: false })
      : query;
    const { data, error } = await orderedQuery;
    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as Person[];
  }, "Không thể tải danh sách thành viên.");
}

export async function listRecentPersons(
  personIdToExclude: string,
  limit = 10,
): Promise<Person[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .neq("id", personIdToExclude)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as Person[];
  }, "Không thể tải danh sách thành viên gần đây.");
}

export async function searchPersonsByName(
  searchTerm: string,
  personIdToExclude: string,
  limit = 5,
): Promise<Person[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .ilike("full_name", `%${searchTerm}%`)
      .neq("id", personIdToExclude)
      .limit(limit);
    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as Person[];
  }, "Không thể tìm kiếm thành viên.");
}

export async function getPersonById(
  personId: string,
): Promise<Person | null> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .eq("id", personId)
      .single();
    if (error) {
      throw error;
    }
    return (data as Person | null) ?? null;
  }, "Không thể tải thông tin thành viên.");
}

export async function createPerson(
  payload: PersonWritePayload,
): Promise<Person> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const insertPayload: PersonInsert = { ...payload };
    const personsTable = supabase.from("persons") as unknown as {
      insert: (
        values: PersonInsert,
      ) => {
        select: (query: string) => {
          single: () => Promise<{ data: Person | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await personsTable
      .insert(insertPayload)
      .select("*")
      .single();
    if (error || !data) {
      throw error ?? new Error("Không tạo được thành viên.");
    }
    return data as Person;
  }, "Không thể tạo thành viên mới.");
}

export async function createPersonQuick(
  payload: PersonQuickCreatePayload,
): Promise<Pick<Person, "id">> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const insertPayload: PersonInsert = { ...payload };
    const personsTable = supabase.from("persons") as unknown as {
      insert: (
        values: PersonInsert,
      ) => {
        select: (query: string) => {
          single: () => Promise<{ data: Pick<Person, "id"> | null; error: { message: string } | null }>;
        };
      };
    };
    const { data, error } = await personsTable
      .insert(insertPayload)
      .select("id")
      .single();
    if (error || !data) {
      throw error ?? new Error("Không tạo được thành viên.");
    }
    return data as Pick<Person, "id">;
  }, "Không thể tạo thành viên.");
}

export async function updatePersonById(
  personId: string,
  payload: PersonWritePayload | Partial<PersonWritePayload>,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const updatePayload: PersonUpdate = { ...payload };
    const personsTable = supabase.from("persons") as unknown as {
      update: (
        values: PersonUpdate,
      ) => { eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }> };
    };
    const { error } = await personsTable.update(updatePayload).eq("id", personId);
    if (error) {
      throw error;
    }
  }, "Không thể cập nhật thành viên.");
}

export async function deletePersonById(
  personId: string,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { error } = await supabase.from("persons").delete().eq("id", personId);
    if (error) {
      throw error;
    }
  }, "Không thể xoá thành viên.");
}

export async function getPersonPrivateDetailsById(
  personId: string,
): Promise<PersonPrivateDetails | null> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("person_details_private")
      .select("*")
      .eq("person_id", personId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    return (data as PersonPrivateDetails | null) ?? null;
  }, "Không thể tải thông tin riêng tư.");
}

export async function upsertPersonPrivateDetails(
  payload: PersonPrivateDetails,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const upsertPayload: PersonPrivateDetailsInsert = { ...payload };
    const privateDetailsTable = supabase.from(
      "person_details_private",
    ) as unknown as {
      upsert: (
        values: PersonPrivateDetailsInsert,
      ) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await privateDetailsTable.upsert(upsertPayload);
    if (error) {
      throw error;
    }
  }, "Không thể lưu thông tin riêng tư.");
}

export async function deletePersonPrivateDetails(
  personId: string,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { error } = await supabase
      .from("person_details_private")
      .delete()
      .eq("person_id", personId);
    if (error) {
      throw error;
    }
  }, "Không thể xoá thông tin riêng tư.");
}

export async function listPersonsForExportSelector(
): Promise<Person[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("persons")
      .select("id, full_name, birth_year, gender, avatar_url, generation")
      .order(PERSONS_ORDER_COLUMN, { ascending: true, nullsFirst: false });
    if (error) {
      throw error;
    }
    return (data ?? []) as unknown as Person[];
  }, "Không thể tải danh sách thành viên để sao lưu.");
}
