"use client";

import { queryKeys } from "@/constants/queryKeys";
import {
  getPersonById,
  getPersonPrivateDetailsById,
  listPersons,
  listPersonsForExportSelector,
  listRecentPersons,
} from "@/services/supabase/person.service";
import { useQuery } from "@tanstack/react-query";

export function usePersonsQuery() {
  return useQuery({
    queryKey: queryKeys.persons,
    queryFn: async () => listPersons({ includeOrderByBirthYear: true }),
  });
}

export function usePersonDetailQuery(personId: string) {
  return useQuery({
    queryKey: queryKeys.personDetail(personId),
    queryFn: async () => {
      const person = await getPersonById(personId);
      if (!person) {
        throw new Error("Không tìm thấy thành viên.");
      }
      return person;
    },
    enabled: Boolean(personId),
  });
}

export function useRecentPersonsQuery(personIdToExclude: string, enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.persons, "recent", personIdToExclude],
    queryFn: async () => listRecentPersons(personIdToExclude),
    enabled,
  });
}

export function usePersonPrivateDetailQuery(personId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.personPrivateDetail(personId),
    queryFn: async () => getPersonPrivateDetailsById(personId),
    enabled: Boolean(personId) && enabled,
  });
}

export function usePersonSelectorQuery() {
  return useQuery({
    queryKey: queryKeys.personSelector,
    queryFn: async () => listPersonsForExportSelector(),
  });
}
