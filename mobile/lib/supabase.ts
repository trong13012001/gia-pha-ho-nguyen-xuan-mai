import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { mmkv } from "@/lib/mmkv";
import { Database } from "@/types/database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
/** Hỗ trợ cả tên biến web (PUBLISHABLE_DEFAULT_KEY) và mobile (ANON_KEY). */
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/** Adapter Supabase Auth — đồng bộ, lưu trên MMKV (nhanh hơn AsyncStorage). */
const authStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => {
    mmkv.set(key, value);
  },
  removeItem: (key: string) => {
    mmkv.remove(key);
  },
};

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc khóa anon (EXPO_PUBLIC_SUPABASE_ANON_KEY) trong mobile/.env",
    );
  }

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
