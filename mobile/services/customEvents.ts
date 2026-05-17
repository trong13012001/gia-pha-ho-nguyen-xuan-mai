import { getSupabaseClient } from "@/lib/supabase";
import { CustomEventRecord } from "@shared/utils/eventHelpers";

export async function fetchCustomEvents(): Promise<CustomEventRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("custom_events")
    .select("id, name, content, event_date, location, created_by");

  if (error) throw new Error(error.message);
  return (data ?? []) as CustomEventRecord[];
}
