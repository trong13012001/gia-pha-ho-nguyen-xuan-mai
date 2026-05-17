import {
  isValidDateParts,
  MemberFormValues,
  NumberInput,
  toNullableNumber,
} from "@/schemas/memberForm";
import { PersonWritePayload } from "@/services/persons";
import { Gender, Person } from "@/types";
import { Lunar, Solar } from "lunar-javascript";

export function personToFormValues(person?: Person | null): MemberFormValues {
  return {
    fullName: person?.full_name ?? "",
    otherNames: person?.other_names ?? "",
    gender: person?.gender ?? "male",
    birthDay: person?.birth_day ?? "",
    birthMonth: person?.birth_month ?? "",
    birthYear: person?.birth_year ?? "",
    isDeceased: person?.is_deceased ?? false,
    deathDay: person?.death_day ?? "",
    deathMonth: person?.death_month ?? "",
    deathYear: person?.death_year ?? "",
    deathLunarDay: person?.death_lunar_day ?? "",
    deathLunarMonth: person?.death_lunar_month ?? "",
    deathLunarYear: person?.death_lunar_year ?? "",
    isInLaw: person?.is_in_law ?? false,
    birthOrder: person?.birth_order ?? "",
    generation: person?.generation ?? "",
    avatarUrl: person?.avatar_url ?? "",
    note: person?.note ?? "",
    phoneNumber: person?.phone_number ?? "",
    occupation: person?.occupation ?? "",
    currentResidence: person?.current_residence ?? "",
  };
}

export function syncSolarDeathToLunar(
  day: NumberInput,
  month: NumberInput,
  year: NumberInput,
): Pick<
  MemberFormValues,
  "deathLunarDay" | "deathLunarMonth" | "deathLunarYear"
> | null {
  if (day === "" || month === "" || year === "" || year <= 100) return null;
  try {
    const solar = Solar.fromYmd(Number(year), Number(month), Number(day));
    const lunar = solar.getLunar();
    return {
      deathLunarDay: lunar.getDay(),
      deathLunarMonth: Math.abs(lunar.getMonth()),
      deathLunarYear: lunar.getYear(),
    };
  } catch {
    return null;
  }
}

export function syncLunarDeathToSolar(
  day: NumberInput,
  month: NumberInput,
  year: NumberInput,
): Pick<MemberFormValues, "deathDay" | "deathMonth" | "deathYear"> | null {
  if (day === "" || month === "" || year === "" || year <= 100) return null;
  try {
    const lunar = Lunar.fromYmd(Number(year), Number(month), Number(day));
    const solar = lunar.getSolar();
    return {
      deathDay: solar.getDay(),
      deathMonth: solar.getMonth(),
      deathYear: solar.getYear(),
    };
  } catch {
    return null;
  }
}

export function resolveDeathDates(values: MemberFormValues): {
  deathDay: NumberInput;
  deathMonth: NumberInput;
  deathYear: NumberInput;
  deathLunarDay: NumberInput;
  deathLunarMonth: NumberInput;
  deathLunarYear: NumberInput;
  error?: string;
} {
  let deathDay = values.deathDay;
  let deathMonth = values.deathMonth;
  let deathYear = values.deathYear;
  let deathLunarDay = values.deathLunarDay;
  let deathLunarMonth = values.deathLunarMonth;
  let deathLunarYear = values.deathLunarYear;

  if (!values.isDeceased) {
    return {
      deathDay: "",
      deathMonth: "",
      deathYear: "",
      deathLunarDay: "",
      deathLunarMonth: "",
      deathLunarYear: "",
    };
  }

  if (
    deathLunarDay !== "" &&
    deathLunarMonth !== "" &&
    deathLunarYear !== "" &&
    (deathDay === "" || deathMonth === "" || deathYear === "")
  ) {
    const solar = syncLunarDeathToSolar(
      deathLunarDay,
      deathLunarMonth,
      deathLunarYear,
    );
    if (!solar) {
      return {
        deathDay,
        deathMonth,
        deathYear,
        deathLunarDay,
        deathLunarMonth,
        deathLunarYear,
        error: "Ngày âm lịch không hợp lệ.",
      };
    }
    deathDay = solar.deathDay;
    deathMonth = solar.deathMonth;
    deathYear = solar.deathYear;
  } else if (
    deathDay !== "" &&
    deathMonth !== "" &&
    deathYear !== "" &&
    (deathLunarDay === "" || deathLunarMonth === "" || deathLunarYear === "")
  ) {
    const lunar = syncSolarDeathToLunar(deathDay, deathMonth, deathYear);
    if (lunar) {
      deathLunarDay = lunar.deathLunarDay;
      deathLunarMonth = lunar.deathLunarMonth;
      deathLunarYear = lunar.deathLunarYear;
    }
  }

  if (
    !isValidDateParts(
      toNullableNumber(deathDay),
      toNullableNumber(deathMonth),
      toNullableNumber(deathYear),
    )
  ) {
    return {
      deathDay,
      deathMonth,
      deathYear,
      deathLunarDay,
      deathLunarMonth,
      deathLunarYear,
      error: "Ngày mất không hợp lệ.",
    };
  }

  if (
    values.birthYear !== "" &&
    deathYear !== "" &&
    Number(deathYear) < Number(values.birthYear)
  ) {
    return {
      deathDay,
      deathMonth,
      deathYear,
      deathLunarDay,
      deathLunarMonth,
      deathLunarYear,
      error: "Năm mất phải lớn hơn hoặc bằng năm sinh.",
    };
  }

  return {
    deathDay,
    deathMonth,
    deathYear,
    deathLunarDay,
    deathLunarMonth,
    deathLunarYear,
  };
}

export function formValuesToPersonPayload(
  values: MemberFormValues,
  avatarUrl?: string | null,
): PersonWritePayload {
  const death = resolveDeathDates(values);
  if (death.error) {
    throw new Error(death.error);
  }

  return {
    full_name: values.fullName.trim(),
    other_names: values.otherNames.trim() || null,
    gender: values.gender as Gender,
    birth_year: toNullableNumber(values.birthYear),
    birth_month: toNullableNumber(values.birthMonth),
    birth_day: toNullableNumber(values.birthDay),
    death_year:
      values.isDeceased && death.deathYear !== ""
        ? Number(death.deathYear)
        : null,
    death_month:
      values.isDeceased && death.deathMonth !== ""
        ? Number(death.deathMonth)
        : null,
    death_day:
      values.isDeceased && death.deathDay !== ""
        ? Number(death.deathDay)
        : null,
    death_lunar_year:
      values.isDeceased && death.deathLunarYear !== ""
        ? Number(death.deathLunarYear)
        : null,
    death_lunar_month:
      values.isDeceased && death.deathLunarMonth !== ""
        ? Number(death.deathLunarMonth)
        : null,
    death_lunar_day:
      values.isDeceased && death.deathLunarDay !== ""
        ? Number(death.deathLunarDay)
        : null,
    is_deceased: values.isDeceased,
    is_in_law: values.isInLaw,
    birth_order: toNullableNumber(values.birthOrder),
    generation: toNullableNumber(values.generation),
    avatar_url:
      avatarUrl !== undefined ? avatarUrl : values.avatarUrl || null,
    note: values.note.trim() || null,
  };
}
