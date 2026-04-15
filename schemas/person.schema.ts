import { z } from "zod";

export const personSchema = z.object({
  full_name: z.string().min(1, "Họ và tên là bắt buộc."),
  gender: z.enum(["male", "female", "other"]),
  birth_year: z.number().int().positive().nullable(),
  birth_month: z.number().int().min(1).max(12).nullable(),
  birth_day: z.number().int().min(1).max(31).nullable(),
  note: z.string().nullable(),
});

export type PersonSchemaInput = z.infer<typeof personSchema>;

