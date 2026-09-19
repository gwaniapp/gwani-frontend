import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { simulateRequest } from "@/lib/simulation";
import type { ProviderRegistrationValues } from "@/lib/validations/providerValidations";

/**
 * SIMULATED — not wired to the backend yet. The real call is
 * `PATCH /providers/me/profile` with `{ bio, location_country, location_city,
 * skill_slugs }`, but `skill_slugs` must come from the `GET /skills` catalog,
 * so the free-text skills field needs to become a catalog autocomplete first
 * (and the category has no backend field at all).
 */
function useProviderRegistration() {
	const router = useRouter();

	return useMutation({
		mutationFn: (values: ProviderRegistrationValues) => simulateRequest(values),
		onSuccess: () => {
			toast.success("Your provider profile has been saved");
			router.push("/provider/wallet");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});
}

export { useProviderRegistration };
