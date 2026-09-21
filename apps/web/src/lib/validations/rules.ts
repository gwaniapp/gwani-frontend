import { z } from "zod";

/**
 * Field rules shared by every form, so the same kind of input is checked the same
 * way everywhere. The limits follow the backend's (names 1–60, email/password
 * lengths are ours, since it only sets minimums) or are deliberately tighter
 * where the UI needs it (see `JOB_TITLE_MAX`).
 */
export const NAME_MAX = 60;
export const EMAIL_MAX = 254;
export const PASSWORD_MAX = 128;
export const PLACE_MAX = 120;
export const AMOUNT_MAX_INTEGER_DIGITS = 9;
export const AMOUNT_MAX_DECIMALS = 7;

/** A person's name: letters (any script), spaces, and the hyphens, apostrophes and full stops real names use — no digits or symbols. */
export const nameSchema = (label: string) =>
	z
		.string()
		.trim()
		.min(1, `Enter your ${label}`)
		.max(NAME_MAX, `${label.charAt(0).toUpperCase()}${label.slice(1)} must be ${NAME_MAX} characters or fewer`)
		.regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u, `${label.charAt(0).toUpperCase()}${label.slice(1)} can only contain letters, spaces, hyphens and apostrophes`);

export const emailSchema = z
	.string()
	.trim()
	.min(1, "Enter your email address")
	.max(EMAIL_MAX, "That email address is too long")
	.email("Enter a valid email address");

/** Keeps only digits, up to `max` of them — for one-time codes. */
export const digitsOnly = (value: string, max = 6) => value.replace(/\D/g, "").slice(0, max);

/**
 * Turns whatever was typed or pasted into a plain decimal number: digits and one
 * decimal point only (so no letters, minus, "e", spaces or commas), at most
 * `AMOUNT_MAX_INTEGER_DIGITS` before the point and `AMOUNT_MAX_DECIMALS` after
 * (Stellar amounts have 7). A leading "." becomes "0.", and leading zeros collapse.
 */
export function sanitizeAmount(value: string) {
	const cleaned = value.replace(/[^\d.]/g, "");
	const dot = cleaned.indexOf(".");
	let whole = dot === -1 ? cleaned : cleaned.slice(0, dot);
	const decimals = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, AMOUNT_MAX_DECIMALS);
	whole = whole.replace(/^0+(?=\d)/, "").slice(0, AMOUNT_MAX_INTEGER_DIGITS);
	if (decimals === null) return whole;
	return `${whole === "" ? "0" : whole}.${decimals}`;
}
