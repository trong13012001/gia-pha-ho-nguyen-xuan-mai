import { queryKeys } from "@/constants/queryKeys";
import { invalidatePersonsAndSyncNotifications } from "@/lib/invalidateAndSyncNotifications";
import { fetchEnrichedRelationships } from "@/services/relationshipManager";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function usePersonRelationships(personId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.personRelationships(personId),
    queryFn: () => fetchEnrichedRelationships(personId),
    enabled: Boolean(personId),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.personRelationships(personId),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.personDetail(personId),
    });
    await invalidatePersonsAndSyncNotifications(queryClient);
  };

  return { ...query, refresh };
}
