import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth, axiosPublic } from "@/lib/config/axios";
import { normalizeProvider } from "@/lib/providers";
import { skillNamesToSlugs, toProfilePayload } from "@/lib/providerProfile";
import type { ApiSuccessResponse, ProviderProfile, Skill } from "@/lib/api/types";
import type { ProviderRegistrationValues } from "@/lib/validations/providerValidations";

const SKILLS_KEY = ["skills"];
const PROVIDER_PROFILE_KEY = ["provider", "me", "profile"];

/** `GET /skills` — the platform's skill catalog (public, cached server-side). It rarely changes, so it's kept for an hour. */
function useSkills() {
	return useQuery({
		queryKey: SKILLS_KEY,
		staleTime: 60 * 60 * 1000,
		queryFn: async () => {
			const { data } = await axiosPublic.get<ApiSuccessResponse<Skill[]>>(apiRoutes.skills);
			return data.data;
		},
	});
}

/**
 * `GET /providers/me/profile` — the signed-in provider's own profile, in the
 * same shape as the public one (`{ user, provider, skills, wallet_address, … }`),
 * normalized (`normalizeProvider`). A brand-new provider may not have one yet
 * (404); that's "no profile" (`null`), not an error.
 */
function useProviderProfile() {
	return useQuery({
		queryKey: PROVIDER_PROFILE_KEY,
		retry: false,
		queryFn: async (): Promise<ProviderProfile | null> => {
			try {
				const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.providers.ME_PROFILE);
				return normalizeProvider(data.data);
			} catch (error) {
				if (isAxiosError(error) && error.response?.status === 404) return null;
				throw error;
			}
		},
	});
}

/** Thrown when a chosen skill isn't in the catalog (it changed since the page loaded, or the catalog didn't finish loading). */
class UnknownSkillError extends Error {
	constructor(public skills: string[]) {
		super(`Not in the skills catalog: ${skills.join(", ")}`);
	}
}

/**
 * `PATCH /providers/me/profile` `{ bio, location_country, location_city,
 * skill_slugs }` — used by provider registration and Settings → Provider
 * Information. Skill names from the form are turned into catalog slugs here.
 * The PATCH answer's shape isn't relied on: the saved profile is simply
 * re-fetched (the profile query is invalidated).
 */
function useSaveProviderProfile(catalog: Skill[] | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "provider.save-profile" },
		mutationFn: async (values: ProviderRegistrationValues) => {
			const { slugs, missing } = skillNamesToSlugs(values.skills, catalog ?? []);
			if (missing.length > 0 || !catalog) throw new UnknownSkillError(missing);
			const { data } = await axiosAuth.patch<ApiSuccessResponse<unknown>>(apiRoutes.providers.ME_PROFILE, toProfilePayload(values, slugs));
			return data.data;
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: PROVIDER_PROFILE_KEY });
			void queryClient.invalidateQueries({ queryKey: ["providers"] });
		},
		onError: (error) => {
			toast.error(
				error instanceof UnknownSkillError
					? "Some of those skills aren't in our list any more. Remove them and pick from the suggestions."
					: getApiErrorMessage(error, undefined, { 403: "Only provider accounts can edit a provider profile." }),
			);
		},
	});
}

export { PROVIDER_PROFILE_KEY, SKILLS_KEY, useProviderProfile, useSaveProviderProfile, useSkills };
