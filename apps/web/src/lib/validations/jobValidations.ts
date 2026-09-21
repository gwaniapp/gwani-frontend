import { z } from "zod";
import { isValidDateString, todayLocal } from "@/lib/dates";
import { AMOUNT_MAX_DECIMALS, AMOUNT_MAX_INTEGER_DIGITS } from "@/lib/validations/rules";

// Mirrors `POST /jobs` (confirmed against the backend's OpenAPI spec): title
// 3–200 characters, description 10–5000, `price_amount` a decimal string with up
// to 7 places. The form is stricter on the title — see `JOB_TITLE_MAX`. The provider isn't part of that call — it's chosen afterwards
// with `POST /jobs/{id}/select-provider` — so `providerId` is only this form's.
/**
 * The longest job title this app lets a client write. The backend would take 200,
 * but a title is shown in cards, dialogs, the wallet and search results, so a short
 * limit keeps every one of those tidy (they also truncate or wrap anything longer
 * that already exists).
 */
export const JOB_TITLE_MAX = 80;

/** The longest job the form accepts, in days (a year). */
export const JOB_DURATION_MAX_DAYS = 365;

export const postJobSchema = z.object({
	providerId: z.string().min(1, "Select a service provider"),
	title: z
		.string()
		.trim()
		.min(3, "Give the job a short title (at least 3 characters)")
		.max(JOB_TITLE_MAX, `Keep the title to ${JOB_TITLE_MAX} characters or fewer`),
	description: z
		.string()
		.trim()
		.min(10, "Add a brief description (at least 10 characters)")
		.max(5000, "Keep the description to 5,000 characters or fewer"),
	// The backend has one date field, `due_date` (target completion). The form asks for a start date and a
	// duration in days and sends start + duration as that due date.
	startDate: z
		.string()
		.min(1, "Pick the date the work should start")
		.refine(isValidDateString, "Enter a valid date")
		.refine((value) => value >= todayLocal(), "The start date can't be in the past"),
	durationDays: z
		.string()
		.trim()
		.min(1, "Enter how many days the work will take")
		.regex(/^\d+$/, "Enter a whole number of days")
		.refine((value) => Number(value) >= 1 && Number(value) <= JOB_DURATION_MAX_DAYS, `Choose between 1 and ${JOB_DURATION_MAX_DAYS} days`),
	amount: z
		.string()
		.trim()
		.min(1, "Enter the amount you'll pay")
		.regex(/^\d+(\.\d+)?$/, "Enter the amount as a number, like 25 or 25.50")
		.refine((value) => (value.split(".")[1] ?? "").length <= AMOUNT_MAX_DECIMALS, `Use up to ${AMOUNT_MAX_DECIMALS} decimal places`)
		.refine((value) => Number(value) > 0, "The amount must be more than 0")
		.refine((value) => value.split(".")[0]!.length <= AMOUNT_MAX_INTEGER_DIGITS, "That amount is too large"),
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
