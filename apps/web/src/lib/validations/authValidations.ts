import { z } from "zod";
import { emailSchema, nameSchema, PASSWORD_MAX, PLACE_MAX } from "@/lib/validations/rules";

// Mirrors the backend's own `POST /auth/signup` rules (confirmed against its
// OpenAPI spec): password is min 8 chars with at least one uppercase letter,
// one lowercase letter and one digit; names are 1–60 characters.
export const PASSWORD_MESSAGE =
	"Use at least 8 characters, with an uppercase letter, a lowercase letter and a number";

export const isValidPassword = (value: string) =>
	value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

/** A new password: the backend's rules, plus an upper length so a paste can't be huge. */
const passwordSchema = (emptyMessage: string) =>
	z.string().min(1, emptyMessage).max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer`).refine(isValidPassword, PASSWORD_MESSAGE);

export const signUpSchema = z.object({
	firstName: nameSchema("first name"),
	lastName: nameSchema("last name"),
	email: emailSchema,
	password: passwordSchema("Enter a password"),
	// Only collected for clients (see `clientSignUpSchema`); not part of `POST /auth/signup`.
	country: z.string().optional(),
	state: z.string().optional(),
	agreeToTerms: z.boolean().refine((value) => value === true, {
		message: "You must agree to the Terms of Service and Privacy Policy",
	}),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const clientSignUpSchema = signUpSchema.extend({
	country: z.string().min(1, "Select your country"),
	state: z.string().trim().min(1, "Select your state or city").max(PLACE_MAX, `Keep it to ${PLACE_MAX} characters or fewer`),
});

export const signInSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Enter your password").max(PASSWORD_MAX, "That password is too long"),
	rememberMe: z.boolean(),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const verifyOtpSchema = z.object({
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// Resetting a password (Settings → Change Password, and the "Forgot password?" page) uses the backend's emailed 6-digit code plus the new password (sign-up rules).
export const resetPasswordSchema = z.object({
	code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
	newPassword: passwordSchema("Enter a new password"),
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
