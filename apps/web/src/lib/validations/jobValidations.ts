import { z } from "zod";

// Mirrors `POST /jobs` (confirmed against the backend's OpenAPI spec): title
// 3–200 characters, description 10–5000, `price_amount` a decimal string with up
// to 7 places. The provider isn't part of that call — it's chosen afterwards
// with `POST /jobs/{id}/select-provider` — so `providerId` is only this form's.
export const postJobSchema = z.object({
	providerId: z.string().min(1, "Select a service provider"),
	title: z
		.string()
		.trim()
		.min(3, "Give the job a short title (at least 3 characters)")
		.max(200, "Keep the title to 200 characters or fewer"),
	description: z
		.string()
		.trim()
		.min(10, "Add a brief description (at least 10 characters)")
		.max(5000, "Keep the description to 5,000 characters or fewer"),
	amount: z
		.string()
		.trim()
		.min(1, "Enter the amount you'll pay")
		.regex(/^\d+(\.\d{1,7})?$/, "Enter a number with up to 7 decimal places")
		.refine((value) => Number(value) > 0, "The amount must be more than 0"),
});
export type PostJobValues = z.infer<typeof postJobSchema>;

// A provider's reason for turning a job down. 500 characters matches the backend's
// transition `note` limit (the closest thing it has to a reason field).
export const rejectJobSchema = z.object({
	reason: z
		.string()
		.trim()
		.min(10, "Tell the client briefly why (at least 10 characters)")
		.max(500, "Keep it to 500 characters or fewer"),
});
export type RejectJobValues = z.infer<typeof rejectJobSchema>;
