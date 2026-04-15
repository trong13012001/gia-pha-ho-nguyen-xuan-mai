"use server";

import { UserRole } from "@/types";
import {
  adminCreateUserServer,
  removeUserByIdServer,
  setUserActiveStatusServer,
  setUserRoleServer,
} from "@/services/supabase/server.service";
import { revalidatePath } from "next/cache";

export async function changeUserRole(userId: string, newRole: UserRole) {
  try {
    await setUserRoleServer(userId, newRole);
  } catch (error) {
    console.error("Failed to change user role:", error);
    return { error: (error as Error).message };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  try {
    await removeUserByIdServer(userId);
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: (error as Error).message };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function adminCreateUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() || "member";

  if (role !== "admin" && role !== "editor" && role !== "member") {
    return { error: "Vai trò không hợp lệ." };
  }

  const isActiveStr = formData.get("is_active")?.toString();
  const isActive = isActiveStr === "false" ? false : true;

  if (!email || !password) {
    return { error: "Email và mật khẩu là bắt buộc." };
  }

  try {
    await adminCreateUserServer({
      email,
      password,
      role: role as UserRole,
      isActive,
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: (error as Error).message };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string, newStatus: boolean) {
  try {
    await setUserActiveStatusServer(userId, newStatus);
  } catch (error) {
    console.error("Failed to change user status:", error);
    return { error: (error as Error).message };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
}
