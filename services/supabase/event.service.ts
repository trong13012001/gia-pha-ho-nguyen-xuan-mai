import {
  getServiceSupabaseClient,
  withServiceErrorHandling,
} from "./base.service";
import { Database } from "@/types/database.types";

export interface CustomEvent {
  id: string;
  name: string;
  content: string | null;
  event_date: string;
  location: string | null;
  created_by: string | null;
}

export interface CustomEventWritePayload {
  name: string;
  event_date: string;
  location: string | null;
  content: string | null;
}

type CustomEventInsert = Database["public"]["Tables"]["custom_events"]["Insert"];
type CustomEventUpdate = Database["public"]["Tables"]["custom_events"]["Update"];

export async function listCustomEvents(
): Promise<CustomEvent[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("custom_events")
      .select("id, name, content, event_date, location, created_by");
    if (error) {
      throw error;
    }
    return (data ?? []) as CustomEvent[];
  }, "Không thể tải danh sách sự kiện.");
}

export async function createCustomEvent(
  payload: CustomEventWritePayload,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const insertPayload: CustomEventInsert = {
      name: payload.name,
      event_date: payload.event_date,
      location: payload.location,
      content: payload.content,
    };
    const customEventsTable = supabase.from("custom_events") as unknown as {
      insert: (values: CustomEventInsert[]) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await customEventsTable.insert([insertPayload]);
    if (error) {
      throw error;
    }
  }, "Không thể tạo sự kiện.");
}

export async function updateCustomEvent(
  eventId: string,
  payload: CustomEventWritePayload,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const updatePayload: CustomEventUpdate = {
      name: payload.name,
      event_date: payload.event_date,
      location: payload.location,
      content: payload.content,
    };
    const customEventsTable = supabase.from("custom_events") as unknown as {
      update: (
        values: CustomEventUpdate,
      ) => { eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }> };
    };
    const { error } = await customEventsTable.update(updatePayload).eq("id", eventId);
    if (error) {
      throw error;
    }
  }, "Không thể cập nhật sự kiện.");
}

export async function deleteCustomEventById(
  eventId: string,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { error } = await supabase.from("custom_events").delete().eq("id", eventId);
    if (error) {
      throw error;
    }
  }, "Không thể xoá sự kiện.");
}
