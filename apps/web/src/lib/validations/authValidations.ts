import { z } from "zod";

// Mirrors the backend's own `POST /auth/signup` rules (confirmed against its
// OpenAPI spec): password is min 8 chars with at least one uppercase letter,
// one lowercase letter and one digit; names are 1–60 characters.
export const PASSWORD_MESSAGE =
	"Use at least 8 characters, with an uppercase letter, a lowercase letter and a number";

export const isValidPassword = (value: string) =>
	value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);

export const signUpSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, "Enter your first name")
		.max(60, "First name must be 60 characters or fewer"),
	lastName: z
		.string()
		.trim()
		.min(1, "Enter your last name")
		.max(60, "Last name must be 60 characters or fewer"),
	email: z
		.string()
		.trim()
		.min(1, "Enter your email address")
		.email("Enter a valid email address"),
	password: z.string().min(1, "Enter a password").refine(isValidPassword, PASSWORD_MESSAGE),
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
	state: z.string().trim().min(1, "Select your state or city"),
});

export const signInSchema = z.object({
	email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address"),
	password: z.string().min(1, "Enter your password"),
	rememberMe: z.boolean(),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const verifyOtpSchema = z.object({
	code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
