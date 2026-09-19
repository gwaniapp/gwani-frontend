/** Used when the connected screen is opened directly, with no wallet in the flow store. */
export const SAMPLE_PUBLIC_KEY = `G924T${"A".repeat(46)}42T59`;

/** "G924T********42T59" — enough to recognise a key without printing all of it. */
export function maskPublicKey(key: string) {
	return `${key.slice(0, 5)}********${key.slice(-5)}`;
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** A well-formed but fake Stellar public key (`G` + 55 base32 chars) for the simulated "generate a wallet". */
export function generateMockPublicKey() {
	const bytes = crypto.getRandomValues(new Uint8Array(55));
	return "G" + Array.from(bytes, (byte) => BASE32[byte % 32]).join("");
}
