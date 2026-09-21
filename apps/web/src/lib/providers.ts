import { COUNTRY_NAMES } from "@repo/ui/lib/country-names";
import type { ProviderProfile, Skill, WalletType } from "@/lib/api/types";

const str = (value: unknown) => (typeof value === "string" ? value : "");
const num = (value: unknown) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Turns either real provider payload into a `ProviderProfile`. Full profile:
 * `{ user: { id, first_name, last_name, … }, provider: { bio, location_*, … },
 * skills: [{id,slug,name}], wallet_address, wallet_type, location: {…},
 * reputation_score, completed_jobs }`. Directory row: the `provider` fields
 * flattened next to `user_id` (`reputation_score` is a string like "0.00";
 * `completed_jobs_count`). Reads defensively (either nesting, snake_case names
 * from both) so a small backend change doesn't blank the screen.
 *
 * Note the full profile also contains the whole `user` row — including the
 * password hash and email — and is public. Only the fields below are ever read
 * or kept; that leak is the backend's to fix.
 */
export function normalizeProvider(raw: unknown): ProviderProfile {
	const r = (raw ?? {}) as Record<string, unknown>;
	const user = (r.user ?? {}) as Record<string, unknown>;
	const provider = ((r.provider ?? r) as Record<string, unknown>) ?? {};
	const where = (r.location ?? {}) as Record<string, unknown>;
	const id = str(user.id) || str(provider.user_id) || str(r.user_id) || str(r.id);

	return {
		id,
		user_id: id,
		first_name: str(user.first_name),
		last_name: str(user.last_name),
		bio: str(provider.bio),
		location_country: str(where.country) || str(provider.location_country),
		location_state: str(where.state) || str(provider.location_state),
		location_city: str(where.city) || str(provider.location_city),
		location_area: str(where.area) || str(provider.location_area),
		skills: Array.isArray(r.skills) ? (r.skills as Skill[]).map((skill) => ({ id: str(skill.id), slug: str(skill.slug), name: str(skill.name) })) : [],
		skill_category: str(r.skill_category) || str(provider.skill_category),
		reputation: num(r.reputation_score ?? provider.reputation_score),
		jobs_completed: num(r.completed_jobs ?? provider.completed_jobs_count),
		wallet_address: str(r.wallet_address) || undefined,
		wallet_type: (str(r.wallet_type) as WalletType) || undefined,
		detailed: Boolean(r.user),
	};
}

/** The provider's name, or a neutral label while it isn't known (never an invented one). */
export function providerName(profile: ProviderProfile) {
	return [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Gwani provider";
}

/** Two letters for an avatar — from the name, or a neutral mark when there's no name. */
export function providerInitials(profile: ProviderProfile) {
	const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
	if (!name) return "GP";
	return name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/** The id `POST /jobs/{id}/select-provider` wants: the provider's user id. */
export function providerUserId(profile: ProviderProfile) {
	return profile.user_id || profile.id;
}

/** "Warri, Delta, Nigeria" from the stored city (which may already hold "Area, State") and country code. */
export function providerLocation(profile: Pick<ProviderProfile, "location_country" | "location_state" | "location_city" | "location_area">) {
	const country = profile.location_country ? (COUNTRY_NAMES[profile.location_country] ?? profile.location_country) : "";
	// The city may already hold "Area, State" (see `encodeCity`), so split and de-duplicate rather than repeat a part.
	const parts = [profile.location_area, profile.location_city, profile.location_state, country].flatMap((part) => part.split(",")).map((part) => part.trim()).filter(Boolean);
	return parts.filter((part, index) => parts.findIndex((other) => other.toLowerCase() === part.toLowerCase()) === index).join(", ");
}

/** What a provider does, in a word: their first listed skill (the backend has no trade/headline field). */
export function providerHeadline(profile: Pick<ProviderProfile, "skills">) {
	return profile.skills[0]?.name ?? "";
}
