"use client";

import { queryKeys } from "@/constants/queryKeys";
import {
  createPerson,
  deletePersonById,
  PersonWritePayload,
  updatePersonById,
} from "@/services/supabase/person.service";
import { Person } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UpdatePersonArgs = { id: string; payload: Partial<PersonWritePayload> };
type BulkUpdatePersonArgs = Array<{
  id: string;
  payload: Partial<PersonWritePayload>;
}>;

export function useCreatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PersonWritePayload) => createPerson(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.persons });
      const previousPersons = queryClient.getQueryData<Person[]>(queryKeys.persons);
      if (previousPersons) {
        queryClient.setQueryData<Person[]>(queryKeys.persons, [
          ...previousPersons,
          {
            ...(payload as unknown as Person),
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
      return { previousPersons };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousPersons) {
        queryClient.setQueryData(queryKeys.persons, context.previousPersons);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.persons });
    },
  });
}

export function useUpdatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: UpdatePersonArgs) => {
      await updatePersonById(args.id, args.payload);
    },
    onSuccess: async (_data, args) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.persons });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.personDetail(args.id),
      });
    },
  });
}

export function useDeletePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personId: string) => deletePersonById(personId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.persons });
    },
  });
}

export function useBulkUpdatePersonsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: BulkUpdatePersonArgs) => {
      await Promise.all(
        updates.map((item) => updatePersonById(item.id, item.payload)),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.persons });
    },
  });
}
