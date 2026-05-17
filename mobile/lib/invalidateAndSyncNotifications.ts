import { queryKeys } from "@/constants/queryKeys";
import { syncEventNotifications } from "@/lib/notifications";
import { fetchCustomEvents } from "@/services/customEvents";
import { fetchPersonsForEvents } from "@/services/persons";
import { QueryClient } from "@tanstack/react-query";

/**
 * Sau khi cập nhật persons / custom_events: refetch và đồng bộ lại thông báo.
 */
export async function invalidatePersonsAndSyncNotifications(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.persons });
  await queryClient.invalidateQueries({ queryKey: queryKeys.customEvents });

  const [persons, customEvents] = await Promise.all([
    fetchPersonsForEvents(),
    fetchCustomEvents(),
  ]);

  queryClient.setQueryData([...queryKeys.persons, "events"], persons);
  queryClient.setQueryData(queryKeys.customEvents, customEvents);

  return syncEventNotifications(persons, customEvents);
}
