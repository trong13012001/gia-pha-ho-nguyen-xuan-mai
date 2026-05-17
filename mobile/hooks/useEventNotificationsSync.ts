import { queryKeys } from "@/constants/queryKeys";
import {
  cancelAllEventNotifications,
  syncEventNotifications,
} from "@/lib/notifications";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchCustomEvents } from "@/services/customEvents";
import { fetchPersonsForEvents } from "@/services/persons";
import { useSession } from "@/hooks/useSession";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * Tự động lên lịch / dọn thông báo khi dữ liệu thay đổi (tạo, sửa, xóa trên web hoặc app).
 */
export function useEventNotificationsSync() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const syncingRef = useRef(false);
  const isLoggedIn = Boolean(session?.user);

  const personsQuery = useQuery({
    queryKey: [...queryKeys.persons, "events"],
    queryFn: fetchPersonsForEvents,
    enabled: isLoggedIn,
  });

  const customEventsQuery = useQuery({
    queryKey: queryKeys.customEvents,
    queryFn: fetchCustomEvents,
    enabled: isLoggedIn,
  });

  const runSync = useCallback(async () => {
    if (!isLoggedIn || !personsQuery.data || syncingRef.current) return;
    syncingRef.current = true;
    try {
      await syncEventNotifications(
        personsQuery.data,
        customEventsQuery.data ?? [],
      );
    } finally {
      syncingRef.current = false;
    }
  }, [isLoggedIn, personsQuery.data, customEventsQuery.data]);

  useEffect(() => {
    if (!isLoggedIn) {
      cancelAllEventNotifications();
      return;
    }
    if (personsQuery.isLoading || customEventsQuery.isLoading) return;
    if (!personsQuery.data) return;
    runSync();
  }, [
    isLoggedIn,
    personsQuery.data,
    personsQuery.dataUpdatedAt,
    customEventsQuery.data,
    customEventsQuery.dataUpdatedAt,
    personsQuery.isLoading,
    customEventsQuery.isLoading,
    runSync,
  ]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const onAppState = (state: AppStateStatus) => {
      if (state === "active") {
        queryClient.invalidateQueries({ queryKey: queryKeys.persons });
        queryClient.invalidateQueries({ queryKey: queryKeys.customEvents });
      }
    };

    const sub = AppState.addEventListener("change", onAppState);
    return () => sub.remove();
  }, [isLoggedIn, queryClient]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("mobile-event-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "persons" },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.persons });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "custom_events" },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.customEvents });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn, queryClient]);

  return { runSync };
}
