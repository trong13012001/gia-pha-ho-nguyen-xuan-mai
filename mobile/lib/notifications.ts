import {
  buildEventNotificationPlan,
  EventNotificationPlanItem,
  EVENT_NOTIFICATION_CHANNEL_ID,
} from "@shared/utils/eventNotificationPlan";
import {
  computeEvents,
  CustomEventRecord,
  PersonEventInput,
} from "@shared/utils/eventHelpers";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const EVENT_NOTIFICATION_PREFIX = "giapha:event:";
const LEGACY_MEMORIAL_PREFIX = "memorial:";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(
    EVENT_NOTIFICATION_CHANNEL_ID,
    {
      name: "Sự kiện gia phả",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    },
  );
}

/** Hủy toàn bộ thông báo đã lên lịch của app (sinh nhật, giỗ, lễ 49/100, …). */
export async function cancelAllEventNotifications(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .map((item) => item.identifier)
    .filter(
      (id): id is string =>
        Boolean(
          id &&
            (id.startsWith(EVENT_NOTIFICATION_PREFIX) ||
              id.startsWith(LEGACY_MEMORIAL_PREFIX)),
        ),
    );

  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  return ids.length;
}

async function schedulePlanItem(item: EventNotificationPlanItem) {
  await Notifications.scheduleNotificationAsync({
    identifier: `${EVENT_NOTIFICATION_PREFIX}${item.identifier}`,
    content: {
      title: item.title,
      body: item.body,
      data: item.data,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: item.triggerAt,
      channelId: EVENT_NOTIFICATION_CHANNEL_ID,
    },
  });
}

export type SyncEventNotificationsResult = {
  scheduled: number;
  cancelled: number;
  permissionGranted: boolean;
};

/**
 * Đồng bộ thông báo: hủy lịch cũ rồi lên lịch lại từ dữ liệu persons + custom events.
 * Gọi sau khi tạo/cập nhật ngày sinh, ngày mất hoặc khi refetch dữ liệu.
 */
export async function syncEventNotifications(
  persons: PersonEventInput[],
  customEvents: CustomEventRecord[] = [],
): Promise<SyncEventNotificationsResult> {
  const permissionGranted = await ensureNotificationPermissions();
  if (!permissionGranted) {
    return { scheduled: 0, cancelled: 0, permissionGranted: false };
  }

  await ensureAndroidChannel();
  const cancelled = await cancelAllEventNotifications();

  const events = computeEvents(persons, customEvents);
  const plan = buildEventNotificationPlan(events);

  for (const item of plan) {
    await schedulePlanItem(item);
  }

  return {
    scheduled: plan.length,
    cancelled,
    permissionGranted: true,
  };
}

/** @deprecated Use syncEventNotifications */
export const syncMemorialNotifications = syncEventNotifications;
