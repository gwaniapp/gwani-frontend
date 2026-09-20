import { z } from "zod";
import { isValidPassword, PASSWORD_MESSAGE } from "@/lib/validations/authValidations";

// `PATCH /users/me` takes first and last name (1–60 characters each) — nothing else is editable there.
export const profileSchema = z.object({
	firstName: z.string().trim().min(1, "Enter your first name").max(60, "First name must be 60 characters or fewer"),
	lastName: z.string().trim().min(1, "Enter your last name").max(60, "Last name must be 60 characters or fewer"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

// The mock has just Old and New password (no confirm field), so the new one
// is checked against the sign-up rules and must differ from the old one.
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Enter your old password"),
		newPassword: z.string().min(1, "Enter a new password").refine(isValidPassword, PASSWORD_MESSAGE),
	})
	.refine((values) => !values.newPassword || values.newPassword !== values.currentPassword, {
		path: ["newPassword"],
		message: "Choose a password you haven't used just now",
	});
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
