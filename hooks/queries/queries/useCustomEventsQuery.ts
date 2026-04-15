"use client";

import { QUERY_KEY } from "@/constants/queryKeys";
import { listCustomEvents } from "@/services/supabase/event.service";
import { useQuery } from "@tanstack/react-query";

export function useCustomEventsQuery() {
  return useQuery({
    queryKey: QUERY_KEY.customEvents,
    queryFn: async () => {
      return listCustomEvents();
    },
  });
}
