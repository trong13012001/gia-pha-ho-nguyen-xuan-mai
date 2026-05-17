import { queryKeys } from "@/constants/queryKeys";
import { fetchCustomEvents } from "@/services/customEvents";
import { useQuery } from "@tanstack/react-query";

export function useCustomEventsQuery() {
  return useQuery({
    queryKey: queryKeys.customEvents,
    queryFn: fetchCustomEvents,
  });
}
