import { getProfileByIdServer } from "@/services/supabase/server.service";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { cache } from "react";

// Hàm này được cache lại để đảm bảo chỉ tạo 1 Supabase Client duy nhất cho mỗi request
export const getSupabase = cache(async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
});

export const getUser = cache(async () => {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getProfile = cache(async (userId?: string) => {
  let id = userId;
  if (!id) {
    const user = await getUser();
    if (!user) return null;
    id = user.id;
  }

  return getProfileByIdServer(id);
});

export const getIsAdmin = cache(async () => {
  const profile = await getProfile();
  return profile?.role === "admin";
});
