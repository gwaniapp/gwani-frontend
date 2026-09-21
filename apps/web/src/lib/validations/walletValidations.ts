import { z } from "zod";
import { AMOUNT_MAX_DECIMALS } from "@/lib/validations/rules";

/** A Stellar public key ("G…"): 56 characters of base32 (A–Z, 2–7). */
export const STELLAR_PUBLIC_KEY = /^G[A-Z2-7]{55}$/;

export const MEMO_MAX = 28;

/**
 * `POST /wallet/transfer` `{ destination, amount, memo? }`: a valid Stellar address that
 * isn't the sender's own, a positive amount of at most 7 decimals, and an optional text
 * memo of up to 28 characters. The amount is also checked against what's on hand
 * (`available`) — escrowed funds aren't sendable — so the person hears about it before
 * anything is sent.
 */
export const transferSchema = (available: number, ownAddress: string) =>
	z.object({
		destination: z
			.string()
			.trim()
			.min(1, "Enter the Stellar address to send to")
			.regex(STELLAR_PUBLIC_KEY, "That doesn't look like a Stellar address (it starts with G and is 56 characters)")
			.refine((value) => value !== ownAddress, "That's your own wallet address — enter a different one"),
		amount: z
			.string()
			.trim()
			.min(1, "Enter the amount to send")
			.regex(/^\d+(\.\d+)?$/, "Enter the amount as a number, like 25 or 25.50")
			.refine((value) => (value.split(".")[1] ?? "").length <= AMOUNT_MAX_DECIMALS, `Use up to ${AMOUNT_MAX_DECIMALS} decimal places`)
			.refine((value) => Number(value) > 0, "The amount must be more than 0")
			.refine((value) => Number(value) <= available, "That's more than you have available to send"),
		memo: z.string().max(MEMO_MAX, `A memo can be at most ${MEMO_MAX} characters`),
	});
export type TransferValues = z.infer<ReturnType<typeof transferSchema>>;
