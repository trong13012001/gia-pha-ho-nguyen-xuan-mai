import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database.types";

function normalizeErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!error) {
    return fallbackMessage;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  const postgrestError = error as PostgrestError;
  if (postgrestError.message) {
    return postgrestError.message;
  }

  return fallbackMessage;
}

export async function withServiceErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackMessage: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new Error(normalizeErrorMessage(error, fallbackMessage));
  }
}

export async function getServiceSupabaseClient(): Promise<SupabaseClient<Database>> {
  // Client-side services only. Server-side callers should use server services.
  return createClient();
}
