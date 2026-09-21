/**
 * The Freighter browser extension, behind a small interface so the rest of the
 * app never touches the extension API directly (and so it can be stubbed).
 *
 * Linking a wallet needs a signature over the backend's challenge string
 * (`POST /wallet/link/challenge` → sign → `POST /wallet/link/verify`).
 *
 * **Caveat, unverified against the backend:** Freighter's `signMessage` follows
 * SEP-53 — it signs `sha256("Stellar Signed Message:\n" + message)`, not the raw
 * message bytes — while the backend's docs describe verifying a *raw* signature
 * (`kp.sign(Buffer.from(challenge))`). If the backend only accepts raw
 * signatures, `verify` will reject Freighter's signature (401) and the backend
 * needs to accept SEP-53 (`Keypair.verifyMessage` in stellar-sdk) for this to
 * work. That can only be settled with a real Freighter + provider account.
 */

export type FreighterFailure = "not-installed" | "rejected" | "mismatch" | "failed";

export class FreighterError extends Error {
	constructor(
		public readonly code: FreighterFailure,
		message: string,
	) {
		super(message);
	}
}

interface FreighterApi {
	isConnected: () => Promise<{ isConnected: boolean; error?: unknown }>;
	requestAccess: () => Promise<{ address: string; error?: unknown }>;
	signMessage: (
		message: string,
		opts?: { address?: string },
	) => Promise<{ signedMessage: string | { toString: (encoding: string) => string } | null; signerAddress: string; error?: unknown }>;
}

declare global {
	interface Window {
		/** Dev/test only: stands in for the extension so the wallet flow can be exercised without it. */
		__GWANI_FREIGHTER__?: FreighterApi;
	}
}

async function load(): Promise<FreighterApi> {
	if (process.env.NODE_ENV !== "production" && typeof window !== "undefined" && window.__GWANI_FREIGHTER__) {
		return window.__GWANI_FREIGHTER__;
	}
	return import("@stellar/freighter-api") as Promise<FreighterApi>;
}

function describe(error: unknown) {
	if (error && typeof error === "object" && "message" in error) return String((error as { message: unknown }).message);
	return typeof error === "string" ? error : "unknown error";
}

/** The account Freighter is currently using — prompts to allow this site the first time. */
export async function getFreighterAddress(): Promise<string> {
	const api = await load();
	const status = await api.isConnected().catch(() => ({ isConnected: false }));
	if (!status.isConnected) {
		throw new FreighterError("not-installed", "Freighter isn't installed or isn't available in this browser.");
	}
	const access = await api.requestAccess();
	if (access.error || !access.address) {
		throw new FreighterError("rejected", `Freighter didn't share the account: ${describe(access.error)}`);
	}
	return access.address;
}

/**
 * Has Freighter sign `challenge` with the account `publicKey`, returning the
 * signature as base64 (what `POST /wallet/link/verify` takes). Fails if
 * Freighter isn't there, the request is declined, or Freighter is on a
 * different account than `publicKey`.
 */
export async function signWalletChallenge(publicKey: string, challenge: string): Promise<string> {
	const api = await load();
	const address = await getFreighterAddress();
	if (address !== publicKey) {
		throw new FreighterError("mismatch", "Freighter is using a different account than the one you entered.");
	}
	const signed = await api.signMessage(challenge, { address: publicKey });
	if (signed.error || !signed.signedMessage) {
		throw new FreighterError("rejected", `Freighter didn't sign the request: ${describe(signed.error)}`);
	}
	// v4+ returns base64 text; older builds returned a Buffer.
	return typeof signed.signedMessage === "string" ? signed.signedMessage : signed.signedMessage.toString("base64");
}
