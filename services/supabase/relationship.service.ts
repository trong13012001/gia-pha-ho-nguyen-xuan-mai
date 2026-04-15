import { Relationship, RelationshipType } from "@/types";
import { Database } from "@/types/database.types";
import {
  getServiceSupabaseClient,
  withServiceErrorHandling,
} from "./base.service";

export interface RelationshipWritePayload {
  person_a: string;
  person_b: string;
  type: RelationshipType;
  note?: string | null;
}

type RelationshipInsert = Database["public"]["Tables"]["relationships"]["Insert"];

export async function listRelationships(
): Promise<Relationship[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase.from("relationships").select("*");
    if (error) {
      throw error;
    }
    return (data ?? []) as Relationship[];
  }, "Không thể tải danh sách quan hệ.");
}

export async function createRelationship(
  payload: RelationshipWritePayload,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const insertPayload: RelationshipInsert = {
      person_a: payload.person_a,
      person_b: payload.person_b,
      type: payload.type,
      note: payload.note ?? null,
    };
    const relationshipsTable = supabase.from("relationships") as unknown as {
      insert: (
        values: RelationshipInsert,
      ) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await relationshipsTable.insert(insertPayload);
    if (error) {
      throw error;
    }
  }, "Không thể tạo mối quan hệ.");
}

export async function deleteRelationshipById(
  relationshipId: string,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { error } = await supabase
      .from("relationships")
      .delete()
      .eq("id", relationshipId);
    if (error) {
      throw error;
    }
  }, "Không thể xoá mối quan hệ.");
}

export async function hasAnyRelationshipsForPerson(
  personId: string,
): Promise<boolean> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("relationships")
      .select("id")
      .or(`person_a.eq.${personId},person_b.eq.${personId}`)
      .limit(1);
    if (error) {
      throw error;
    }
    return (data?.length ?? 0) > 0;
  }, "Không thể kiểm tra mối quan hệ gia đình.");
}
