import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { simulatedApiError, simulateRequest } from "@/lib/simulation";
import type { ProviderRegistrationValues } from "@/lib/validations/providerValidations";
import type { ChangePasswordValues, ProfileValues } from "@/lib/validations/settingsValidations";

/** Entering this as the current password fails, to exercise the error state. */
const WRONG_CURRENT_PASSWORD = "Wrong123";

/**
 * SIMULATED — the real call is `PATCH /users/me` `{ first_name, last_name }`
 * (the only editable fields), then update the cached `GET /users/me`.
 */
function useUpdateProfile() {
	return useMutation({
		mutationFn: (values: ProfileValues) => simulateRequest(values),
		onSuccess: () => toast.success("Profile updated"),
		onError: (error) => toast.error(getApiErrorMessage(error)),
	});
}

/**
 * SIMULATED — and **the backend has no signed-in change-password endpoint**.
 * It only has the OTP flow (`POST /auth/forgot-password` → `POST
 * /auth/reset-password`, which also revokes every refresh token). Going live
 * means either asking the backend team for something like
 * `POST /users/me/password { current_password, new_password }`, or sending
 * this form through the OTP reset flow instead (email a code, then set the
 * new password). Current password `Wrong123` fails, to show the error state.
 */
function useChangePassword() {
	return useMutation({
		mutationFn: (values: ChangePasswordValues) =>
			simulateRequest(
				values.currentPassword === WRONG_CURRENT_PASSWORD
					? simulatedApiError(400, "Your current password is incorrect")
					: true,
			),
		onSuccess: () => toast.success("Password updated"),
		onError: (error) => toast.error(getApiErrorMessage(error)),
	});
}

/**
 * SIMULATED — the backend only has *admin-side* erasure
 * (`DELETE /admin/users/{id}`, GDPR anonymize + soft delete) and export, no
 * self-service delete, so this is framed as a request (support/admin acts on
 * it) rather than an instant deletion.
 */
function useRequestAccountDeletion() {
	return useMutation({
		mutationFn: () => simulateRequest(true, 1100),
		onSuccess: () => toast.success("Request received. We'll email you to confirm before anything is deleted."),
		onError: (error) => toast.error(getApiErrorMessage(error)),
	});
}

/**
 * SIMULATED — the real call is `PATCH /providers/me/profile` with
 * `{ bio, location_country, location_city, skill_slugs }`. Same gaps as the
 * registration form: `skill_slugs` must come from the `GET /skills` catalog
 * (the free-text skills field has to become a catalog autocomplete), and the
 * backend has no category or separate state/area (only country + city).
 */
function useUpdateProviderProfile() {
	return useMutation({
		mutationFn: (values: ProviderRegistrationValues) => simulateRequest(values),
		onSuccess: () => toast.success("Provider information updated"),
		onError: (error) => toast.error(getApiErrorMessage(error)),
	});
}

export { useChangePassword, useRequestAccountDeletion, useUpdateProfile, useUpdateProviderProfile };
