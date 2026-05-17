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
  /** Solar date of the next occurrence */
  nextOccurrence: Date;
  /** Days until the next occurrence (negative = already passed) */
  daysUntil: number;
  /** Display label for the date of the event */
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

/** Day offsets from lunar death anchor (day 1 = death day). */
export const MEMORIAL_49_OFFSET = 48;
export const MEMORIAL_100_OFFSET = 99;

/**
 * Resolves lunar death anchor and returns the solar date of death (day 1).
 */
export function getLunarDeathAnchorSolar(
  person: Pick<
    PersonEventInput,
    | "death_year"
    | "death_month"
    | "death_day"
    | "death_lunar_year"
    | "death_lunar_month"
    | "death_lunar_day"
  >,
): { solar: ReturnType<typeof Solar.fromYmd>; lunarLabel: string } | null {
  try {
    if (person.death_lunar_year && person.death_lunar_month && person.death_lunar_day) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const LunarClass = Lunar as any;
      const lMonth = Math.abs(person.death_lunar_month);
      const lunar = LunarClass.fromYmd(
        person.death_lunar_year,
        lMonth,
        person.death_lunar_day,
      );
      const solar = lunar.getSolar();
      const lDay = person.death_lunar_day.toString().padStart(2, "0");
      const lMon = lMonth.toString().padStart(2, "0");
      return {
        solar: Solar.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay()),
        lunarLabel: `${lDay}/${lMon}/${person.death_lunar_year} ÂL`,
      };
    }
    if (person.death_year && person.death_month && person.death_day) {
      const solar = Solar.fromYmd(
        person.death_year,
        person.death_month,
        person.death_day,
      );
      const lunar = solar.getLunar();
      const lMonth = Math.abs(lunar.getMonth());
      const lDay = lunar.getDay().toString().padStart(2, "0");
      const lMon = lMonth.toString().padStart(2, "0");
      return {
        solar,
        lunarLabel: `${lDay}/${lMon}/${lunar.getYear()} ÂL`,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function solarToDate(solar: ReturnType<typeof Solar.fromYmd>): Date {
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from);
  const b = new Date(to);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * One-time memorial milestones (49 and 100 days) from lunar death anchor.
 */
export function computeMemorialMilestones(
  person: PersonEventInput,
  today: Date = new Date(),
): FamilyEvent[] {
  if (!person.is_deceased) return [];

  const anchor = getLunarDeathAnchorSolar(person);
  if (!anchor) return [];

  const todayNorm = new Date(today);
  todayNorm.setHours(0, 0, 0, 0);

  const milestones: { type: "memorial_49" | "memorial_100"; offset: number; label: string }[] = [
    { type: "memorial_49", offset: MEMORIAL_49_OFFSET, label: "49 ngày" },
    { type: "memorial_100", offset: MEMORIAL_100_OFFSET, label: "100 ngày" },
  ];

  const events: FamilyEvent[] = [];

  for (const m of milestones) {
    const targetSolar = anchor.solar.next(m.offset);
    const nextOccurrence = solarToDate(targetSolar);
    const daysUntil = daysBetween(todayNorm, nextOccurrence);

    const d = nextOccurrence.getDate().toString().padStart(2, "0");
    const mo = (nextOccurrence.getMonth() + 1).toString().padStart(2, "0");
    const y = nextOccurrence.getFullYear();

    events.push({
      personId: person.id,
      personName: person.full_name,
      type: m.type,
      nextOccurrence,
      daysUntil,
      eventDateLabel: `${m.label} (${d}/${mo}/${y} DL · mốc ${anchor.lunarLabel})`,
      originYear: person.death_lunar_year ?? person.death_year,
      originMonth: person.death_lunar_month ?? person.death_month,
      originDay: person.death_lunar_day ?? person.death_day,
      isDeceased: true,
    });
  }

  return events;
}

/**
 * Finds the next solar Date on which a given lunar (month, day) falls,
 * starting from `fromDate`.
 */
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
      const candidate = new Date(s.getYear(), s.getMonth() - 1, s.getDay());
      if (candidate >= fromDate) return candidate;
    } catch {
      // lunar date may not exist in this year
    }
  }
  return null;
}

/**
 * Computes upcoming FamilyEvents from a list of persons.
 */
export function computeEvents(
  persons: PersonEventInput[],
  customEvents: CustomEventRecord[] = [],
): FamilyEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events: FamilyEvent[] = [];

  for (const p of persons) {
    // ── Birthday (solar) ────────────────────────────────────────────
    if (p.birth_month && p.birth_day) {
      const thisYear = today.getFullYear();
      const thisYearDate = new Date(thisYear, p.birth_month - 1, p.birth_day);
      const isUpcoming = thisYearDate >= today;

      const next = isUpcoming
        ? thisYearDate
        : new Date(thisYear + 1, p.birth_month - 1, p.birth_day);

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

    // ── Death anniversary (lunar, recurring yearly) ─────────────────
    if (
      p.is_deceased &&
      ((p.death_lunar_month && p.death_lunar_day) || (p.death_month && p.death_day))
    ) {
      try {
        let lMonth: number;
        let lDay: number;

        if (p.death_lunar_month && p.death_lunar_day) {
          lMonth = p.death_lunar_month;
          lDay = p.death_lunar_day;
        } else {
          const deathYear = p.death_year ?? new Date().getFullYear();
          const solar = Solar.fromYmd(deathYear, p.death_month as number, p.death_day as number);
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
          originYear: (p.death_lunar_year ?? p.death_year) || null,
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
            const pastLunar = LunarClass.fromYmd(currentLunarYear, lMonth, lDay);
            const pastSolar = pastLunar.getSolar();
            const pastDate = new Date(
              pastSolar.getYear(),
              pastSolar.getMonth() - 1,
              pastSolar.getDay(),
            );
            if (pastDate < today) {
              events.push({
                ...deathEvent,
                nextOccurrence: pastDate,
                daysUntil: daysBetween(today, pastDate),
              });
            }
          } catch {
            // skip
          }
        }
      } catch {
        // skip
      }
    }

    // ── Memorial 49 / 100 days (one-time) ───────────────────────────
    events.push(...computeMemorialMilestones(p, today));
  }

  // ── Custom Events (solar) ───────────────────────────────────────
  for (const ce of customEvents) {
    if (!ce.event_date) continue;
    const [y, m, d] = ce.event_date.split("-").map(Number);
    if (!y || !m || !d) continue;

    const next = new Date(y, m - 1, d);
    const daysUntil = daysBetween(today, next);

    events.push({
      personId: ce.id,
      personName: ce.name,
      type: "custom_event",
      nextOccurrence: next,
      daysUntil,
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

/** Memorial events eligible for local notification scheduling (T-3 .. T-0). */
export function getMemorialEventsForNotification(
  persons: PersonEventInput[],
  maxDaysAhead = 90,
): FamilyEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return computeEvents(persons)
    .filter(
      (e) =>
        (e.type === "memorial_49" || e.type === "memorial_100") &&
        e.daysUntil >= 0 &&
        e.daysUntil <= maxDaysAhead,
    );
}
