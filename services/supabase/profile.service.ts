import { Profile } from "@/types";
import {
  getServiceSupabaseClient,
  withServiceErrorHandling,
} from "./base.service";

export async function getProfileById(
  userId: string,
): Promise<Profile | null> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      throw error;
    }
    return (data as Profile | null) ?? null;
  }, "Không thể tải hồ sơ người dùng.");
}
