"use server";

import { getProfile } from "@/utils/supabase/queries";
import {
  deletePersonByIdServer,
  getPersonByIdServer,
  hasAnyRelationshipsForPersonServer,
} from "@/services/supabase/server.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteMemberProfile(memberId: string) {
  const profile = await getProfile();

  if (profile?.role !== "admin" && profile?.role !== "editor") {
    return {
      error: "Từ chối truy cập. Chỉ Admin hoặc Editor mới có quyền xoá hồ sơ.",
    };
  }

  try {
    await getPersonByIdServer(memberId);
  } catch {
    return { error: "Thành viên không tồn tại." };
  }

  let hasRelationships = false;
  try {
    hasRelationships = await hasAnyRelationshipsForPersonServer(memberId);
  } catch (error) {
    console.error("Error checking relationships:", error);
    return { error: "Lỗi kiểm tra mối quan hệ gia đình." };
  }

  if (hasRelationships) {
    return {
      error:
        "Không thể xoá. Vui lòng xoá hết các mối quan hệ gia đình của người này trước.",
    };
  }

  // 3. Delete the member
  try {
    await deletePersonByIdServer(memberId);
  } catch (error) {
    console.error("Error deleting person:", error);
    return { error: "Đã xảy ra lỗi khi xoá hồ sơ." };
  }

  // 4. Revalidate and redirect
  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}
