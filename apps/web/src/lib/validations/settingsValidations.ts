import { z } from "zod";
import { nameSchema } from "@/lib/validations/rules";

// `PATCH /users/me` takes first and last name (1–60 characters each) — nothing else is editable there.
export const profileSchema = z.object({
	firstName: nameSchema("first name"),
	lastName: nameSchema("last name"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

