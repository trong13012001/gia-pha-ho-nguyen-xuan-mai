import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { queryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    enabled: isSupabaseConfigured(),
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    staleTime: 60_000,
  });
}
