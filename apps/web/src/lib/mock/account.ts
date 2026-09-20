import { MOCK_PROVIDER } from "@/lib/mock/providerDashboard";
import { MOCK_PROFILE } from "@/lib/mock/providerProfile";
import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";
import type { ProviderRegistrationValues } from "@/lib/validations/providerValidations";

/** The mock signed-in account (both roles share the one mock user until real auth: `GET /users/me`). */
export const MOCK_ACCOUNT = {
	firstName: MOCK_PROVIDER.firstName,
	lastName: MOCK_PROVIDER.lastName,
	email: "john.doe@example.com",
};

/**
 * What the Provider Information form starts with — the same mock provider as
 * the profile page (bio, skills), plus the category/location the backend
 * doesn't model (see `providerOptions.ts`).
 */
export const MOCK_PROVIDER_INFO: ProviderRegistrationValues = {
	bio: MOCK_PROFILE.about,
	category: SERVICE_CATEGORIES[0].value,
	skills: MOCK_PROFILE.skills,
	country: "NG",
	state: "Lagos",
	area: "Lekki",
};
