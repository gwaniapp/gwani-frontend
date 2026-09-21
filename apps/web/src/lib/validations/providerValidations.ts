import { z } from "zod";
import { PLACE_MAX } from "@/lib/validations/rules";

export const providerRegistrationSchema = z.object({
	bio: z
		.string()
		.trim()
		.min(10, "Tell us a bit more about yourself (at least 10 characters)")
		.max(500, "Keep it to 500 characters or fewer"),
	category: z.string().min(1, "Select a category"),
	skills: z.array(z.string()).min(1, "Add at least one skill or service").max(20, "You can add up to 20 skills"),
	country: z.string().min(1, "Select your country"),
	state: z.string().trim().min(1, "Select your state or city").max(PLACE_MAX, `Keep it to ${PLACE_MAX} characters or fewer`),
	area: z.string().trim().max(PLACE_MAX, `Keep it to ${PLACE_MAX} characters or fewer`).optional(),
});
export type ProviderRegistrationValues = z.infer<typeof providerRegistrationSchema>;

// A Stellar public key ("G…"): 56 characters of base32 (A–Z, 2–7).
export const connectWalletSchema = z.object({
	publicKey: z
		.string()
		.trim()
		.min(1, "Enter your Stellar public key")
		.regex(/^G[A-Z2-7]{55}$/, "That doesn't look like a Stellar public key (it starts with G and is 56 characters)"),
});
export type ConnectWalletValues = z.infer<typeof connectWalletSchema>;
