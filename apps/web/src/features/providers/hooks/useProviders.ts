import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosPublic } from "@/lib/config/axios";
import { normalizeProvider } from "@/lib/providers";
import type { ApiSuccessResponse, ProviderProfile } from "@/lib/api/types";

export const PROVIDERS_PAGE_SIZE = 6;
const POOL = 50;
const OPTIONS = 20;

export interface ProviderSearch {
	/** Free text: matched against skills and city (the backend can't search names). */
	text: string;
	/** A catalog skill slug (the "skills" chip). */
	skill: string;
	/** ISO country code. */
	country: string;
	/** Minimum reputation, "0"–"5" as a string (the chip's value); empty = any. */
	minRating: string;
	page: number;
}

interface Discovered {
	items: ProviderProfile[];
	total: number;
}

function readDiscovered(envelope: ApiSuccessResponse<unknown> | undefined): Discovered {
	const payload = envelope?.data;
	if (Array.isArray(payload)) return { items: payload.map(normalizeProvider), total: payload.length };
	const page = (payload ?? {}) as { items?: unknown; data?: unknown; total?: number };
	const raw = Array.isArray(page.items) ? page.items : Array.isArray(page.data) ? page.data : [];
	return { items: raw.map(normalizeProvider), total: typeof page.total === "number" ? page.total : raw.length };
}

async function discover(params: Record<string, string | number | undefined>): Promise<Discovered> {
	const clean = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));
	const { data } = await axiosPublic.get<ApiSuccessResponse<unknown>>(apiRoutes.providers.DISCOVER, { params: clean });
	return readDiscovered(data);
}

/** `GET /providers/{id}` — the full profile (name, skills, bio, location, reputation, wallet address). */
async function fetchProvider(id: string): Promise<ProviderProfile> {
	const { data } = await axiosPublic.get<ApiSuccessResponse<unknown>>(apiRoutes.providers.byId(id));
	return normalizeProvider(data.data);
}

/**
 * The directory rows (`/providers/discover`) carry **no name and no skills**, so
 * a card built from one alone can't say who the provider is. Each visible row is
 * filled in from its full profile — one request per provider on the page (six),
 * in parallel, and a row whose profile can't be fetched just stays as it was.
 */
function withProfiles(items: ProviderProfile[]) {
	return Promise.all(items.map((item) => fetchProvider(item.id).catch(() => item)));
}

const slugify = (text: string) => text.trim().toLowerCase().replace(/\s+/g, "-");

/**
 * `GET /providers/discover` — public. The backend filters by `skill` (slug,
 * partial), `country`, `city` (partial) and `min_reputation`, and pages with
 * `page` / `page_size`; it can't search by provider name or take one text box.
 *
 * With no text this is one paged request. With text, two run and are merged
 * (up to 50 providers each): providers whose skill matches and providers whose
 * city matches — then paged here. Names can't be searched (the list has none).
 * Either way, the visible page is then filled in with each provider's profile.
 */
function useProviderSearch(search: ProviderSearch) {
	return useQuery({
		queryKey: ["providers", "search", search],
		placeholderData: keepPreviousData,
		queryFn: async (): Promise<Discovered> => {
			const common = { country: search.country, min_reputation: search.minRating };
			const text = search.text.trim();

			if (!text) {
				const page = await discover({ ...common, skill: search.skill, page: search.page, page_size: PROVIDERS_PAGE_SIZE });
				return { items: await withProfiles(page.items), total: page.total };
			}

			const [bySkill, byCity] = await Promise.all([
				search.skill ? Promise.resolve<Discovered>({ items: [], total: 0 }) : discover({ ...common, skill: slugify(text), page_size: POOL }),
				discover({ ...common, skill: search.skill, city: text, page_size: POOL }),
			]);
			const merged = new Map<string, ProviderProfile>();
			for (const provider of [...bySkill.items, ...byCity.items]) merged.set(provider.id, provider);
			const all = [...merged.values()];
			const start = (search.page - 1) * PROVIDERS_PAGE_SIZE;
			return { items: await withProfiles(all.slice(start, start + PROVIDERS_PAGE_SIZE)), total: all.length };
		},
	});
}

/** The first 20 providers with their names, for the "Service Provider" picker on the post-a-job form. */
function useProviderOptions() {
	return useQuery({
		queryKey: ["providers", "options"],
		queryFn: async (): Promise<Discovered> => {
			const page = await discover({ page_size: OPTIONS });
			return { items: await withProfiles(page.items), total: page.total };
		},
	});
}

/** `GET /providers/{id}` — a provider's public profile. */
function useProvider(id: string | undefined) {
	return useQuery({
		queryKey: ["providers", "detail", id],
		enabled: Boolean(id),
		queryFn: () => fetchProvider(id as string),
	});
}

export { useProvider, useProviderOptions, useProviderSearch };
