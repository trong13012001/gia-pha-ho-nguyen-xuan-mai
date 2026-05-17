import { queryKeys } from "@/constants/queryKeys";
import { fetchPersonsForEvents, fetchPersonsList } from "@/services/persons";
import { useQuery } from "@tanstack/react-query";

export function usePersonsListQuery() {
  return useQuery({
    queryKey: queryKeys.persons,
    queryFn: fetchPersonsList,
  });
}

export function usePersonsForEventsQuery() {
  return useQuery({
    queryKey: [...queryKeys.persons, "events"],
    queryFn: fetchPersonsForEvents,
  });
}
