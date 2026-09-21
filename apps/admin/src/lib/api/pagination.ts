import type { ApiSuccessResponse, Page } from "@/lib/api/types";

/**
 * The admin list endpoints answer `{ data | items: [...], total, page, page_size }` (the spec
 * says `data`, the rest of the API says `items`) — or, for some, a bare array. This reads any
 * of those into one `Page`, so a screen never cares which it got.
 */
export function readPage<T>(envelope: ApiSuccessResponse<unknown> | undefined, fallbackPage: number, fallbackPageSize: number): Page<T> {
	const payload = envelope?.data;
	if (Array.isArray(payload)) return { items: payload as T[], total: payload.length, page: fallbackPage, pageSize: fallbackPageSize };
	const body = (payload ?? {}) as { items?: unknown; data?: unknown; total?: number; page?: number; page_size?: number };
	const items = (Array.isArray(body.items) ? body.items : Array.isArray(body.data) ? body.data : []) as T[];
	return {
		items,
		total: typeof body.total === "number" ? body.total : items.length,
		page: typeof body.page === "number" ? body.page : fallbackPage,
		pageSize: typeof body.page_size === "number" ? body.page_size : fallbackPageSize,
	};
}
