import { z } from "zod";

const usernameRe = /^[a-zA-Z0-9_\.]{2,24}$/;

/** Sign-up & password-reset only — login still accepts any legacy password length from the provider. */
export const passwordPolicy = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Keep it under 72 characters")
  .regex(/[A-Z]/, "Add at least one capital letter")
  .regex(/[0-9]/, "Add at least one number");

/** Live checklist — must match {@link passwordPolicy} rules. */
export function getPasswordRequirementState(password: string) {
  return {
    minLength: password.length >= 8,
    hasCapital: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  } as const;
}

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: passwordPolicy,
    confirmPassword: z.string().min(1, "Confirm your password"),
    username: z
      .string()
      .regex(usernameRe, "2–24 letters, numbers, '.' or '_'"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotInput = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({
    password: passwordPolicy,
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });
export type ResetInput = z.infer<typeof resetSchema>;
