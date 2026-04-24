import { z } from "zod";

const handleRe = /^[a-z0-9_\.]{2,24}$/i;
const usernameRe = /^[a-zA-Z0-9_\.]{2,24}$/;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72, "Keep it under 72 characters"),
  username: z
    .string()
    .regex(usernameRe, "2–24 letters, numbers, '.' or '_'"),
  handle: z
    .string()
    .regex(handleRe, "2–24 lowercase letters, numbers, '.' or '_'")
    .transform((v) => v.toLowerCase()),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotInput = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string().min(8, "At least 8 characters"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });
export type ResetInput = z.infer<typeof resetSchema>;
