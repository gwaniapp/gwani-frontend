/**
 * The backend's paginated payloads aren't consistent with its own docs: the
 * OpenAPI prose says `{ data: T[], next_cursor }` for cursor lists but the live
 * `providers/discover` answers `{ items, total, page, page_size }` (inside the
 * usual `{ data, meta }` envelope). The cursor endpoints (`GET /jobs`) can't be
 * observed without an account, so this accepts every shape seen or documented —
 * a bare array, `{ items }`, or `{ data }` — plus a `next_cursor` next to it or
 * in `meta`. Anything else is treated as an empty page (and the raw response is
 * in the `[api:…]` console log to check).
 */
export function readCursorPage<T>(envelope: { data?: unknown; meta?: object } | undefined): { items: T[]; next: string | null } {
	const payload = envelope?.data;
	const metaCursor = (envelope?.meta as { next_cursor?: string | null } | undefined)?.next_cursor ?? null;
	if (Array.isArray(payload)) return { items: payload as T[], next: metaCursor };
	if (payload && typeof payload === "object") {
		const page = payload as { items?: unknown; data?: unknown; next_cursor?: string | null };
		const list = Array.isArray(page.items) ? page.items : Array.isArray(page.data) ? page.data : [];
		return { items: list as T[], next: page.next_cursor ?? metaCursor };
	}
	return { items: [], next: null };
}
