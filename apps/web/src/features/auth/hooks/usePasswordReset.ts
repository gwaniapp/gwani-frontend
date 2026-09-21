import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosPublic } from "@/lib/config/axios";

/**
 * `POST /auth/forgot-password` `{ email }` — emails a 6-digit code. Always 204,
 * whether or not the account exists (so it can't be used to probe emails); 5 per
 * hour per IP. Used by Settings → Change Password (with the signed-in user's own
 * email) and by the "Forgot password?" page.
 */
function useSendResetCode() {
	return useMutation({
		meta: { action: "auth.forgot-password" },
		mutationFn: async (email: string) => {
			await axiosPublic.post(apiRoutes.auth.FORGOT_PASSWORD, { email });
			return { email };
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "We couldn't send the code. Please try again.")),
	});
}

/**
 * `POST /auth/reset-password` `{ email, otp, new_password }` — sets the new
 * password if the code is right, and **revokes every refresh token** (all
 * devices), so whoever calls this has to sign in again. 400 = wrong or expired
 * code; 10 per 15 minutes per IP. The caller handles what happens next.
 */
function useResetPassword() {
	return useMutation({
		meta: { action: "auth.reset-password" },
		mutationFn: async (values: { email: string; code: string; newPassword: string }) => {
			await axiosPublic.post(apiRoutes.auth.RESET_PASSWORD, { email: values.email, otp: values.code, new_password: values.newPassword });
		},
		onError: (error) =>
			toast.error(
				getApiErrorMessage(error, undefined, {
					400: "That code is invalid or has expired. Check it, or request a new one.",
					404: "We couldn't find an account for that email.",
				}),
			),
	});
}

export { useResetPassword, useSendResetCode };
