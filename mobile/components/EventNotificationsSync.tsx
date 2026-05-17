import { useEventNotificationsSync } from "@/hooks/useEventNotificationsSync";

/** Không render UI — chỉ đồng bộ thông báo nền. */
export function EventNotificationsSync() {
  useEventNotificationsSync();
  return null;
}
