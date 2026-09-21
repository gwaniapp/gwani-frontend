import { z } from "zod";

export const signInSchema = z.object({
	email: z.string().trim().min(1, "Enter your email address").max(254, "That email address is too long").email("Enter a valid email address"),
	password: z.string().min(1, "Enter your password").max(128, "That password is too long"),
});
export type SignInValues = z.infer<typeof signInSchema>;
