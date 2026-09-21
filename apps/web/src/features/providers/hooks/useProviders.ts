import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth, axiosPublic } from "@/lib/config/axios";
import { normalizeProvider } from "@/lib/providers";
import type { ApiSuccessResponse, ProviderProfile } from "@/lib/api/types";

export const PROVIDERS_PAGE_SIZE = 6;
const POOL = 50;
const OPTIONS = 20;

export interface ProviderSearch {
	/** Free text: matched against provider names, category and location (search) and skills (directory). */
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
 * The directory rows (`/providers/discover`) carry **no name, picture or skills**
 * (and the search rows no skills), so a card built from one alone is thin. Each
 * visible row is filled in from its full profile — one request per provider on the
 * page (six), in parallel, and a row whose profile can't be fetched stays as it was.
 */
function withProfiles(items: ProviderProfile[]) {
	return Promise.all(items.map((item) => fetchProvider(item.id).catch(() => item)));
}

const slugify = (text: string) => text.trim().toLowerCase().replace(/\s+/g, "-");

/**
 * `GET /providers/search` — **clients only** (needs the JWT): free text across a
 * provider's *name*, category and location, plus `min_reputation`. Rows carry the
 * name, picture, category, reputation and location but no skills. Up to 50.
 */
async function searchByText(query: string, minRating: string): Promise<Discovered> {
	const params = Object.fromEntries(Object.entries({ query, min_reputation: minRating, page_size: POOL }).filter(([, value]) => value !== ""));
	const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.providers.SEARCH, { params });
	return readDiscovered(data);
}

/**
 * The Find Providers results. The backend filters the public directory
 * (`GET /providers/discover`) by `skill` (slug, partial), `country`, `city` and
 * `min_reputation`, and pages it; free text goes to `GET /providers/search`, which
 * matches names, category and location (not skills).
 *
 * - No text: one paged directory request.
 * - Text, no skill chip: the search matches *plus* the providers whose skill matches
 *   the text (a directory request for that slug), merged.
 * - Text and a skill chip: the directory's providers for that skill, narrowed to the
 *   ones the search matched.
 *
 * Merged results are paged here, and the visible page is filled in with each
 * provider's full profile (skills, bio, picture).
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

			// If the search endpoint is unavailable, fall back to what the public directory can match: the city.
			const named = await searchByText(text, search.minRating).catch(() => discover({ ...common, city: text, page_size: POOL }));
			// The search has no country filter, so narrow its rows by the chip here.
			const byCountry = (provider: ProviderProfile) => !search.country || provider.location_country === search.country;
			let all: ProviderProfile[];
			if (search.skill) {
				const inSkill = await discover({ ...common, skill: search.skill, page_size: POOL });
				const wanted = new Set(named.items.map((provider) => provider.id));
				all = inSkill.items.filter((provider) => wanted.has(provider.id));
			} else {
				const bySkill = await discover({ ...common, skill: slugify(text), page_size: POOL });
				const merged = new Map<string, ProviderProfile>();
				for (const provider of [...named.items.filter(byCountry), ...bySkill.items]) merged.set(provider.id, provider);
				all = [...merged.values()];
			}
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
