/** A placeholder address for screens still on mock data (dashboard profile and wallet). */
export const SAMPLE_PUBLIC_KEY = `G924T${"A".repeat(46)}42T59`;

/** "G924T********42T59" — enough to recognise a key without printing all of it. */
export function maskPublicKey(key: string) {
	return `${key.slice(0, 5)}********${key.slice(-5)}`;
}
