import {
  EventType,
  FamilyEvent,
  isMemorialMilestone,
} from "./eventHelpers";

export const EVENT_NOTIFICATION_CHANNEL_ID = "family-events";
/** @deprecated Use EVENT_NOTIFICATION_CHANNEL_ID */
export const MEMORIAL_NOTIFICATION_CHANNEL_ID = EVENT_NOTIFICATION_CHANNEL_ID;

export const EVENT_NOTIFICATION_HOUR = 8;
export const EVENT_NOTIFICATION_MINUTE = 0;
export const EVENT_NOTIFY_DAYS_BEFORE = 3;
/** Chỉ lên lịch trigger trong vòng N ngày (tránh vượt giới hạn iOS ~64). */
export const EVENT_NOTIFICATION_MAX_HORIZON_DAYS = 60;
export const EVENT_NOTIFICATION_MAX_SCHEDULED = 60;

export const NOTIFIABLE_EVENT_TYPES: EventType[] = [
  "birthday",
  "death_anniversary",
  "memorial_49",
  "memorial_100",
  "custom_event",
];

export interface EventNotificationPlanItem {
  identifier: string;
  triggerAt: Date;
  title: string;
  body: string;
  data: {
    personId: string | null;
    type: EventType;
    eventDate: string;
    daysBefore: number;
  };
}

/** @deprecated Use EventNotificationPlanItem */
export type MemorialNotificationPlanItem = EventNotificationPlanItem;

export function isNotifiableEventType(type: EventType): boolean {
  return NOTIFIABLE_EVENT_TYPES.includes(type);
}

function eventLabel(type: EventType): string {
  switch (type) {
    case "birthday":
      return "sinh nhật";
    case "death_anniversary":
      return "ngày giỗ";
    case "memorial_49":
      return "lễ 49 ngày";
    case "memorial_100":
      return "lễ 100 ngày";
    case "custom_event":
      return "sự kiện";
    default:
      return "sự kiện";
  }
}

function notificationCopy(
  event: FamilyEvent,
  daysBefore: number,
): { title: string; body: string } {
  const label = eventLabel(event.type);
  const dateStr = event.nextOccurrence.toLocaleDateString("vi-VN");
  const name = event.personName;

  if (daysBefore === 0) {
    if (event.type === "birthday") {
      return {
        title: "Sinh nhật hôm nay",
        body: `Hôm nay (${dateStr}) là sinh nhật của ${name}.`,
      };
    }
    if (event.type === "death_anniversary") {
      return {
        title: "Ngày giỗ hôm nay",
        body: `Hôm nay (${dateStr}) là ngày giỗ của ${name}.`,
      };
    }
    if (isMemorialMilestone(event.type)) {
      return {
        title: `Hôm nay là ${label}`,
        body: `Hôm nay (${dateStr}) là ngày ${label} của ${name}.`,
      };
    }
    return {
      title: `Hôm nay: ${name}`,
      body: `Sự kiện vào ${dateStr}.`,
    };
  }

  return {
    title: `Còn ${daysBefore} ngày — ${label}`,
    body: `${name} — ${label} vào ${dateStr}.`,
  };
}

function atNotificationTime(date: Date): Date {
  const trigger = new Date(date);
  trigger.setHours(
    EVENT_NOTIFICATION_HOUR,
    EVENT_NOTIFICATION_MINUTE,
    0,
    0,
  );
  return trigger;
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Giữ lần xuất hiện sớm nhất (daysUntil nhỏ nhất) cho mỗi người + loại sự kiện. */
function dedupeNotifiableEvents(events: FamilyEvent[]): FamilyEvent[] {
  const seen = new Map<string, FamilyEvent>();

  for (const event of events) {
    if (!isNotifiableEventType(event.type)) continue;
    if (event.daysUntil < 0) continue;

    const key = `${event.type}:${event.personId ?? event.personName}`;
    const prev = seen.get(key);
    if (!prev || event.daysUntil < prev.daysUntil) {
      seen.set(key, event);
    }
  }

  return [...seen.values()].sort((a, b) => a.daysUntil - b.daysUntil);
}

export function buildEventNotificationPlan(
  events: FamilyEvent[],
  now = new Date(),
): EventNotificationPlanItem[] {
  const plans: EventNotificationPlanItem[] = [];

  for (const event of dedupeNotifiableEvents(events)) {
    for (
      let daysBefore = EVENT_NOTIFY_DAYS_BEFORE;
      daysBefore >= 0;
      daysBefore--
    ) {
      if (event.daysUntil < daysBefore) continue;

      const day = new Date(event.nextOccurrence);
      day.setDate(day.getDate() - daysBefore);
      const triggerAt = atNotificationTime(day);
      if (triggerAt <= now) continue;

      const horizon = daysBetween(now, triggerAt);
      if (horizon > EVENT_NOTIFICATION_MAX_HORIZON_DAYS) continue;

      const copy = notificationCopy(event, daysBefore);
      const eventDate = event.nextOccurrence.toISOString().slice(0, 10);

      plans.push({
        identifier: `${event.type}:${event.personId ?? event.personName}:${eventDate}:d${daysBefore}`,
        triggerAt,
        title: copy.title,
        body: copy.body,
        data: {
          personId: event.personId,
          type: event.type,
          eventDate,
          daysBefore,
        },
      });
    }
  }

  return plans
    .sort((a, b) => a.triggerAt.getTime() - b.triggerAt.getTime())
    .slice(0, EVENT_NOTIFICATION_MAX_SCHEDULED);
}

/** @deprecated Use buildEventNotificationPlan */
export function buildMemorialNotificationPlan(
  events: FamilyEvent[],
  now = new Date(),
): EventNotificationPlanItem[] {
  return buildEventNotificationPlan(
    events.filter((e) => isMemorialMilestone(e.type)),
    now,
  );
}
