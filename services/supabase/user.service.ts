import { AdminUserData, UserRole } from "@/types";
import { Database } from "@/types/database.types";
import {
  getServiceSupabaseClient,
  withServiceErrorHandling,
} from "./base.service";

type RpcArgsMap = Database["public"]["Functions"];

export async function getAdminUsers(
): Promise<AdminUserData[]> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const { data, error } = await supabase.rpc("get_admin_users");
    if (error) {
      throw error;
    }
    return (data ?? []) as AdminUserData[];
  }, "Không thể tải danh sách người dùng.");
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const rpcClient = supabase as unknown as {
      rpc: (
        fn: "set_user_role",
        args: RpcArgsMap["set_user_role"]["Args"],
      ) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await rpcClient.rpc("set_user_role", {
      target_user_id: userId,
      new_role: role,
    });
    if (error) {
      throw error;
    }
  }, "Không thể cập nhật vai trò người dùng.");
}

export async function removeUserById(
  userId: string,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const rpcClient = supabase as unknown as {
      rpc: (
        fn: "delete_user",
        args: RpcArgsMap["delete_user"]["Args"],
      ) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await rpcClient.rpc("delete_user", {
      target_user_id: userId,
    });
    if (error) {
      throw error;
    }
  }, "Không thể xoá người dùng.");
}

export async function adminCreateUser(
  payload: {
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  },
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const rpcClient = supabase as unknown as {
      rpc: (
        fn: "admin_create_user",
        args: RpcArgsMap["admin_create_user"]["Args"],
      ) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await rpcClient.rpc("admin_create_user", {
      new_email: payload.email,
      new_password: payload.password,
      new_role: payload.role,
      new_active: payload.isActive,
    });
    if (error) {
      throw error;
    }
  }, "Không thể tạo người dùng mới.");
}

export async function setUserActiveStatus(
  userId: string,
  isActive: boolean,
): Promise<void> {
  return withServiceErrorHandling(async () => {
    const supabase = await getServiceSupabaseClient();
    const rpcClient = supabase as unknown as {
      rpc: (
        fn: "set_user_active_status",
        args: RpcArgsMap["set_user_active_status"]["Args"],
      ) => Promise<{ error: { message: string } | null }>;
    };
    const { error } = await rpcClient.rpc("set_user_active_status", {
      target_user_id: userId,
      new_status: isActive,
    });
    if (error) {
      throw error;
    }
  }, "Không thể cập nhật trạng thái người dùng.");
}
