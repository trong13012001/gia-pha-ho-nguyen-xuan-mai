import { z } from "zod";

export type NumberInput = number | "";

export const toNullableNumber = (value: NumberInput) =>
  value === "" ? null : Number(value);

export const isValidDateParts = (
  day: number | null,
  month: number | null,
  year: number | null,
) => {
  if (day !== null && (day < 1 || day > 31)) return false;
  if (month !== null && (month < 1 || month > 12)) return false;
  if (year !== null && year < 1) return false;
  if (day !== null && month !== null) {
    const y = year ?? 2000;
    const daysInMonth = new Date(y, month, 0).getDate();
    return day <= daysInMonth;
  }
  return true;
};

export const memberFormSchema = z
  .object({
    fullName: z.string().trim().min(1, "Họ và tên là bắt buộc."),
    otherNames: z.string(),
    gender: z.enum(["male", "female", "other"]),
    birthDay: z.union([z.number().int(), z.literal("")]),
    birthMonth: z.union([z.number().int(), z.literal("")]),
    birthYear: z.union([z.number().int(), z.literal("")]),
    isDeceased: z.boolean(),
    deathDay: z.union([z.number().int(), z.literal("")]),
    deathMonth: z.union([z.number().int(), z.literal("")]),
    deathYear: z.union([z.number().int(), z.literal("")]),
    deathLunarDay: z.union([z.number().int(), z.literal("")]),
    deathLunarMonth: z.union([z.number().int(), z.literal("")]),
    deathLunarYear: z.union([z.number().int(), z.literal("")]),
    isInLaw: z.boolean(),
    birthOrder: z.union([z.number().int(), z.literal("")]),
    generation: z.union([z.number().int(), z.literal("")]),
    avatarUrl: z.string(),
    note: z.string(),
    phoneNumber: z.string(),
    occupation: z.string(),
    currentResidence: z.string(),
  })
  .superRefine((data, ctx) => {
    if (
      !isValidDateParts(
        toNullableNumber(data.birthDay),
        toNullableNumber(data.birthMonth),
        toNullableNumber(data.birthYear),
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.",
        path: ["birthDay"],
      });
    }

    if (
      data.isDeceased &&
      !isValidDateParts(
        toNullableNumber(data.deathDay),
        toNullableNumber(data.deathMonth),
        toNullableNumber(data.deathYear),
      )
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Ngày mất không hợp lệ. Vui lòng kiểm tra lại.",
        path: ["deathDay"],
      });
    }

    if (
      data.isDeceased &&
      toNullableNumber(data.birthYear) !== null &&
      toNullableNumber(data.deathYear) !== null &&
      (toNullableNumber(data.deathYear) as number) <
        (toNullableNumber(data.birthYear) as number)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Năm mất phải lớn hơn hoặc bằng năm sinh.",
        path: ["deathYear"],
      });
    }
  });

export type MemberFormSchemaInput = z.infer<typeof memberFormSchema>;

