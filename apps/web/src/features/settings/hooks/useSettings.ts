import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { SESSION_KEY } from "@/features/auth/hooks/useSession";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import type { ApiSuccessResponse, User } from "@/lib/api/types";
import { simulatedApiError, simulateRequest } from "@/lib/simulation";
import type { ChangePasswordValues, ProfileValues } from "@/lib/validations/settingsValidations";

/** Entering this as the current password fails, to exercise the error state. */
const WRONG_CURRENT_PASSWORD = "Wrong123";

/**
 * `PATCH /users/me` `{ first_name, last_name }` (the only editable fields);
 * the returned user replaces the cached `GET /users/me`, so the header and
 * greeting update straight away.
 */
function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "settings.update-profile" },
		mutationFn: async (values: ProfileValues) => {
			const { data } = await axiosAuth.patch<ApiSuccessResponse<User>>(apiRoutes.users.ME, {
				first_name: values.firstName,
				last_name: values.lastName,
			});
			return data.data;
		},
		onSuccess: (user) => {
			queryClient.setQueryData(SESSION_KEY, user);
			toast.success("Profile updated");
		},
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

export { useChangePassword, useRequestAccountDeletion, useUpdateProfile };
