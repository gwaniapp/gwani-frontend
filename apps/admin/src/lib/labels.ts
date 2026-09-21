import { formatAmount } from "@/lib/format";

/** "PROVIDER_SELECTED" -> "Provider selected" (for places the shared badge isn't used, e.g. a select). */
export function statusLabel(status: string) {
	const words = status.toLowerCase().replace(/_/g, " ");
	return words.charAt(0).toUpperCase() + words.slice(1);
}

/** A person's name, or a dash for an erased/blank one. */
export function fullName(user: { first_name?: string; last_name?: string }) {
	return [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || "—";
}

/** "1b2c3d4e-…" -> "1b2c3d4e" for tables; the full id stays in the row's dialog. */
export function shortId(id: string | null | undefined) {
	return id ? id.slice(0, 8) : "—";
}

/** A decimal-string price -> "1,200 USDC". */
export function priceLabel(amount: string, asset: string) {
	return formatAmount(Number(amount) || 0, asset);
}

/**
 * `volume.paid` / `volume.locked_in_escrow` are "grouped by asset"; the exact shape isn't documented
 * (an object keyed by asset, or a list of rows), so read either into `[asset, amount]` pairs.
 */
export function volumeEntries(volume: unknown): Array<[string, number]> {
	if (!volume) return [];
	if (Array.isArray(volume)) {
		return volume.map((row) => {
			const r = row as Record<string, unknown>;
			return [String(r.price_asset ?? r.asset ?? "USDC"), Number(r.total ?? r.sum ?? r.amount ?? r.volume ?? 0) || 0] as [string, number];
		});
	}
	if (typeof volume === "object") return Object.entries(volume as Record<string, unknown>).map(([asset, amount]) => [asset, Number(amount) || 0] as [string, number]);
	return [["USDC", Number(volume) || 0]];
}
