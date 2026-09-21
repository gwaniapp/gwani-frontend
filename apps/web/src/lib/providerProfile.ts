import { MOCK_STATES } from "@/lib/mock/locations";
import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";
import type { ProviderProfile, Skill } from "@/lib/api/types";
import type { ProviderRegistrationValues } from "@/lib/validations/providerValidations";

/**
 * The provider forms (registration, Settings → Provider Information) map onto the
 * backend's `PATCH /providers/me/profile`: `bio`, `skill_category` (the category's
 * label — a broad grouping, distinct from the skills), `skill_slugs` (from the
 * catalog), and the location as `location_country` (ISO code), `location_state`,
 * `location_area` and `location_city`. The form has no separate city, so the city
 * is the area (or the state when there's no area) — that is what the directory's
 * city search matches. Older profiles saved before these fields existed hold
 * "Area, State" packed into the city; `decodeCity` still reads those.
 */

/** "Lekki" + "Lagos" → "Lekki, Lagos"; either part may be empty. */
export function encodeCity(state: string, area?: string) {
	return [area?.trim(), state.trim()].filter(Boolean).join(", ").slice(0, 120);
}

/** The reverse of `encodeCity`: the last part is the state/city, whatever's before it is the area. */
export function decodeCity(country: string, city: string | null) {
	if (!city) return { state: "", area: "" };
	const parts = city.split(",").map((part) => part.trim()).filter(Boolean);
	const last = parts.at(-1) ?? "";
	const states = MOCK_STATES[country];
	// For a country with a fixed list, a last part that isn't on it can't fill the dropdown — keep the text as the area.
	if (states && !states.includes(last)) return { state: "", area: parts.join(", ") };
	return { state: last, area: parts.slice(0, -1).join(", ") };
}

/** The category whose skill list contains any of these skills — used to preselect the (UI-only) category on edit. */
export function inferCategory(skillNames: string[]) {
	const wanted = new Set(skillNames.map((name) => name.toLowerCase()));
	return SERVICE_CATEGORIES.find((category) => category.skills.some((skill) => wanted.has(skill.toLowerCase())))?.value ?? "";
}

/** Skill names → catalog slugs. A name that isn't in the catalog can't be saved, so it's reported instead of dropped. */
export function skillNamesToSlugs(names: string[], catalog: Skill[]) {
	const byName = new Map(catalog.map((skill) => [skill.name.toLowerCase(), skill.slug]));
	const missing = names.filter((name) => !byName.has(name.toLowerCase()));
	return { slugs: names.flatMap((name) => byName.get(name.toLowerCase()) ?? []), missing };
}

/** Form values → the `PATCH /providers/me/profile` body. */
export function toProfilePayload(values: ProviderRegistrationValues, slugs: string[]) {
	const category = SERVICE_CATEGORIES.find((item) => item.value === values.category);
	return {
		bio: values.bio.trim(),
		...(category ? { skill_category: category.label } : {}),
		location_country: values.country,
		location_state: values.state.trim().slice(0, 120),
		location_area: (values.area ?? "").trim().slice(0, 120),
		location_city: ((values.area ?? "").trim() || values.state.trim()).slice(0, 120),
		skill_slugs: slugs,
	};
}

/** A saved profile → form values (empty strings where the backend has nothing yet). */
export function profileToFormValues(profile: ProviderProfile | null | undefined): ProviderRegistrationValues {
	const country = profile?.location_country ?? "";
	const skills = (profile?.skills ?? []).map((skill) => skill.name);
	const decoded = decodeCity(country, profile?.location_city ?? null);
	return {
		bio: profile?.bio ?? "",
		category: SERVICE_CATEGORIES.find((item) => item.label.toLowerCase() === (profile?.skill_category ?? "").toLowerCase())?.value ?? inferCategory(skills),
		skills,
		country,
		// The backend has its own state/area fields; prefer them when set, else fall back to what was packed into the city.
		state: profile?.location_state || decoded.state,
		area: profile?.location_area || decoded.area,
	};
}
