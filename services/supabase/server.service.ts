import { AdminUserData, Person, Profile, UserRole } from "@/types";
import { Database } from "@/types/database.types";
import { getSupabase } from "@/utils/supabase/queries";

export interface PersonPrivateDetails {
  person_id: string;
  phone_number: string | null;
  occupation: string | null;
  current_residence: string | null;
}

type RpcArgsMap = Database["public"]["Functions"];

export async function getProfileByIdServer(
  userId: string,
): Promise<Profile | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function listPersonsServer(select = "*"): Promise<Person[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("persons")
    .select(select)
    .order("birth_year", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as unknown as Person[];
}

export async function listRelationshipsServer() {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("relationships").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function listCustomEventsServer() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("custom_events")
    .select("id, name, content, event_date, location, created_by");
  if (error) throw error;
  return data ?? [];
}

export async function getPersonByIdServer(personId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("id", personId)
    .single();
  if (error) throw error;
  return (data ?? null) as Person | null;
}

export async function getPersonPrivateDetailsByIdServer(personId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("person_details_private")
    .select("*")
    .eq("person_id", personId)
    .maybeSingle();
  if (error) throw error;
  return (data as PersonPrivateDetails | null) ?? null;
}

export async function hasAnyRelationshipsForPersonServer(personId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("relationships")
    .select("id")
    .or(`person_a.eq.${personId},person_b.eq.${personId}`)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function deletePersonByIdServer(personId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from("persons").delete().eq("id", personId);
  if (error) throw error;
}

export async function getAdminUsersServer(): Promise<AdminUserData[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("get_admin_users");
  if (error) throw error;
  return (data ?? []) as AdminUserData[];
}

export async function setUserRoleServer(userId: string, role: UserRole) {
  const supabase = await getSupabase();
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
  if (error) throw error;
}

export async function removeUserByIdServer(userId: string) {
  const supabase = await getSupabase();
  const rpcClient = supabase as unknown as {
    rpc: (
      fn: "delete_user",
      args: RpcArgsMap["delete_user"]["Args"],
    ) => Promise<{ error: { message: string } | null }>;
  };
  const { error } = await rpcClient.rpc("delete_user", {
    target_user_id: userId,
  });
  if (error) throw error;
}

export async function adminCreateUserServer(payload: {
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}) {
  const supabase = await getSupabase();
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
  if (error) throw error;
}

export async function setUserActiveStatusServer(
  userId: string,
  isActive: boolean,
) {
  const supabase = await getSupabase();
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
  if (error) throw error;
}
