import { useRouter } from "next/navigation";
import { toast } from "@repo/ui/sonner";
import { useSaveProviderProfile } from "@/features/provider/hooks/useProviderProfile";
import type { Skill } from "@/lib/api/types";
import type { ProviderRegistrationValues } from "@/lib/validations/providerValidations";

/**
 * Provider registration = saving the profile (`PATCH /providers/me/profile`,
 * see `useSaveProviderProfile`), then on to the wallet step. The category the
 * form asks for isn't sent — the backend has no such field; it only narrows the
 * skill suggestions.
 */
function useProviderRegistration(catalog: Skill[] | undefined) {
	const router = useRouter();
	const save = useSaveProviderProfile(catalog);

	return {
		...save,
		mutate: (values: ProviderRegistrationValues) =>
			save.mutate(values, {
				onSuccess: () => {
					toast.success("Your provider profile has been saved");
					router.push("/provider/wallet");
				},
			}),
	};
}

export { useProviderRegistration };
