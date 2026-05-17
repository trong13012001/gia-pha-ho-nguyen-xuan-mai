import { Lunar, Solar } from "lunar-javascript";

export type EventType =
  | "birthday"
  | "death_anniversary"
  | "memorial_49"
  | "memorial_100"
  | "custom_event";

export interface FamilyEvent {
  personId: string | null;
  personName: string;
  type: EventType;
  nextOccurrence: Date;
  daysUntil: number;
  eventDateLabel: string;
  originYear?: number | null;
  originMonth?: number | null;
  originDay?: number | null;
  isDeceased: boolean;
  location?: string | null;
  content?: string | null;
}

export interface CustomEventRecord {
  id: string;
  name: string;
  content: string | null;
  event_date: string;
  location: string | null;
  created_by: string | null;
}

export interface PersonEventInput {
  id: string;
  full_name: string;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  death_year: number | null;
  death_month: number | null;
  death_day: number | null;
  death_lunar_year: number | null;
  death_lunar_month: number | null;
  death_lunar_day: number | null;
  is_deceased: boolean;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function addSolarDays(base: Date, days: number): Date {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

function nextSolarForLunar(
  lunarMonth: number,
  lunarDay: number,
  fromDate: Date,
): Date | null {
  const todaySolar = Solar.fromYmd(
    fromDate.getFullYear(),
    fromDate.getMonth() + 1,
    fromDate.getDate(),
  );
  const currentLunarYear = todaySolar.getLunar().getYear();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LunarClass = Lunar as any;
  for (let offset = 0; offset <= 2; offset++) {
    try {
      const l = LunarClass.fromYmd(
        currentLunarYear + offset,
        lunarMonth,
        lunarDay,
      );
      const s = l.getSolar();
      const candidate = startOfDay(
        new Date(s.getYear(), s.getMonth() - 1, s.getDay()),
      );
      if (candidate >= fromDate) return candidate;
    } catch {
      // leap month edge case
    }
  }
  return null;
}

function pushMemorialMilestone(
  events: FamilyEvent[],
  person: PersonEventInput,
  deathDate: Date,
  offsetDays: 49 | 100,
  type: "memorial_49" | "memorial_100",
  today: Date,
) {
  const occurrence = addSolarDays(deathDate, offsetDays);
  const daysUntil = daysBetween(today, occurrence);
  const label =
    type === "memorial_49" ? "Lễ 49 ngày" : "Lễ 100 ngày";

  events.push({
    personId: person.id,
    personName: person.full_name,
    type,
    nextOccurrence: occurrence,
    daysUntil,
    eventDateLabel: `${occurrence.getDate().toString().padStart(2, "0")}/${(occurrence.getMonth() + 1).toString().padStart(2, "0")}/${occurrence.getFullYear()} — ${label}`,
    originYear: person.death_year,
    originMonth: person.death_month,
    originDay: person.death_day,
    isDeceased: true,
    content: `Tính từ ngày mất ${person.death_day}/${person.death_month}/${person.death_year} (dương lịch)`,
  });
}

export function computeEvents(
  persons: PersonEventInput[],
  customEvents: CustomEventRecord[] = [],
): FamilyEvent[] {
  const today = startOfDay(new Date());
  const events: FamilyEvent[] = [];

  for (const p of persons) {
    if (p.birth_month && p.birth_day) {
      const thisYear = today.getFullYear();
      const thisYearDate = startOfDay(
        new Date(thisYear, p.birth_month - 1, p.birth_day),
      );
      const isUpcoming = thisYearDate >= today;
      const next = isUpcoming
        ? thisYearDate
        : startOfDay(new Date(thisYear + 1, p.birth_month - 1, p.birth_day));
      const daysUntil = daysBetween(today, next);

      const baseEvent: FamilyEvent = {
        personId: p.id,
        personName: p.full_name,
        type: "birthday",
        nextOccurrence: next,
        daysUntil,
        eventDateLabel: `${p.birth_day.toString().padStart(2, "0")}/${p.birth_month.toString().padStart(2, "0")}`,
        originYear: p.birth_year || null,
        originMonth: p.birth_month,
        originDay: p.birth_day,
        isDeceased: p.is_deceased,
      };
      events.push(baseEvent);

      if (!isUpcoming) {
        events.push({
          ...baseEvent,
          nextOccurrence: thisYearDate,
          daysUntil: daysBetween(today, thisYearDate),
        });
      }
    }

    if (
      p.is_deceased &&
      p.death_year &&
      p.death_month &&
      p.death_day
    ) {
      const deathDate = startOfDay(
        new Date(p.death_year, p.death_month - 1, p.death_day),
      );
      pushMemorialMilestone(events, p, deathDate, 49, "memorial_49", today);
      pushMemorialMilestone(events, p, deathDate, 100, "memorial_100", today);
    }

    if (
      p.is_deceased &&
      ((p.death_lunar_month && p.death_lunar_day) ||
        (p.death_month && p.death_day))
    ) {
      try {
        let lMonth: number;
        let lDay: number;

        if (p.death_lunar_month && p.death_lunar_day) {
          lMonth = p.death_lunar_month;
          lDay = p.death_lunar_day;
        } else {
          const deathYear = p.death_year ?? new Date().getFullYear();
          const solar = Solar.fromYmd(
            deathYear,
            p.death_month as number,
            p.death_day as number,
          );
          const lunar = solar.getLunar();
          lMonth = Math.abs(lunar.getMonth());
          lDay = lunar.getDay();
        }

        const next = nextSolarForLunar(lMonth, lDay, today);
        if (!next) continue;

        const daysUntil = daysBetween(today, next);
        const deathEvent: FamilyEvent = {
          personId: p.id,
          personName: p.full_name,
          type: "death_anniversary",
          nextOccurrence: next,
          daysUntil,
          eventDateLabel: `${lDay.toString().padStart(2, "0")}/${lMonth.toString().padStart(2, "0")} ÂL`,
          originYear: p.death_lunar_year ?? p.death_year,
          originMonth: p.death_lunar_month ?? p.death_month,
          originDay: p.death_lunar_day ?? p.death_day,
          isDeceased: p.is_deceased,
        };
        events.push(deathEvent);

        if (daysUntil > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const LunarClass = Lunar as any;
          const todaySolar = Solar.fromYmd(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate(),
          );
          const currentLunarYear = todaySolar.getLunar().getYear();
          try {
            const pastLunar = LunarClass.fromYmd(
              currentLunarYear,
              lMonth,
              lDay,
            );
            const pastSolar = pastLunar.getSolar();
            const pastDate = startOfDay(
              new Date(
                pastSolar.getYear(),
                pastSolar.getMonth() - 1,
                pastSolar.getDay(),
              ),
            );
            if (pastDate < today) {
              events.push({
                ...deathEvent,
                nextOccurrence: pastDate,
                daysUntil: daysBetween(today, pastDate),
              });
            }
          } catch {
            // skip invalid lunar date
          }
        }
      } catch {
        // skip conversion failure
      }
    }
  }

  for (const ce of customEvents) {
    if (!ce.event_date) continue;
    const [y, m, d] = ce.event_date.split("-").map(Number);
    if (!y || !m || !d) continue;

    const next = startOfDay(new Date(y, m - 1, d));
    events.push({
      personId: ce.id,
      personName: ce.name,
      type: "custom_event",
      nextOccurrence: next,
      daysUntil: daysBetween(today, next),
      eventDateLabel: `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`,
      originYear: y,
      isDeceased: false,
      location: ce.location,
      content: ce.content,
    });
  }

  events.sort((a, b) => a.daysUntil - b.daysUntil);
  return events;
}

export function isMemorialMilestone(type: EventType): boolean {
  return type === "memorial_49" || type === "memorial_100";
}
