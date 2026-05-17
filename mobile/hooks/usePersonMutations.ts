import { queryKeys } from "@/constants/queryKeys";
import { invalidatePersonsAndSyncNotifications } from "@/lib/invalidateAndSyncNotifications";
import {
  createPerson,
  deletePerson,
  PersonWritePayload,
  updatePerson,
} from "@/services/persons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonWritePayload) => createPerson(payload),
    onSuccess: async () => {
      await invalidatePersonsAndSyncNotifications(queryClient);
    },
  });
}

export function useUpdatePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<PersonWritePayload>;
    }) => updatePerson(id, payload),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.personDetail(id),
      });
      await invalidatePersonsAndSyncNotifications(queryClient);
    },
  });
}

export function useDeletePersonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personId: string) => deletePerson(personId),
    onSuccess: async () => {
      await invalidatePersonsAndSyncNotifications(queryClient);
    },
  });
}
