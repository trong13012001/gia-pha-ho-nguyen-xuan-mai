import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(6, "Mật khẩu xác nhận không hợp lệ."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const authFormSchema = z
  .object({
    mode: z.enum(["login", "register"]),
    email: z.email("Email không hợp lệ."),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "register") {
      if (!data.confirmPassword || data.confirmPassword.length < 6) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Mật khẩu xác nhận không hợp lệ.",
        });
      } else if (data.confirmPassword !== data.password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Mật khẩu xác nhận không khớp.",
        });
      }
    }
  });

export type AuthFormInput = z.infer<typeof authFormSchema>;

