import { z } from "zod";

// `PATCH /users/me` takes first and last name (1–60 characters each) — nothing else is editable there.
export const profileSchema = z.object({
	firstName: z.string().trim().min(1, "Enter your first name").max(60, "First name must be 60 characters or fewer"),
	lastName: z.string().trim().min(1, "Enter your last name").max(60, "Last name must be 60 characters or fewer"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

