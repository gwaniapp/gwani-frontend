import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { SESSION_KEY } from "@/features/auth/hooks/useSession";
import { axiosPublic } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSignUpFlowStore } from "@/lib/stores/signUpFlowStore";
import type { ApiSuccessResponse, AuthTokensData } from "@/lib/api/types";
import type { VerifyOtpValues } from "@/lib/validations/authValidations";

/** Thrown when the OTP screen is opened with no email in the sign-up flow (a direct visit or a cleared tab). */
class MissingEmailError extends Error {
	constructor() {
		super("No email in the sign-up flow");
	}
}

/**
 * `POST /auth/verify-otp` `{ email, otp }` — activates the account and returns
 * `{ access_token, refresh_token, user }`, which is the first real session:
 * tokens go into the cookie store, the user into the session cache, and the
 * "verified" screen is shown for the role the backend reports (not the one
 * remembered from sign-up). 10 attempts per 15 minutes per IP.
 */
function useVerifyOtp() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "auth.verify-otp" },
		mutationFn: async (values: VerifyOtpValues) => {
			const email = useSignUpFlowStore.getState().email;
			if (!email) throw new MissingEmailError();
			const { data } = await axiosPublic.post<ApiSuccessResponse<AuthTokensData>>(apiRoutes.auth.VERIFY_OTP, {
				email,
				otp: values.code,
			});
			return data.data;
		},
		onSuccess: (session) => {
			useAuthStore.getState().setTokens(session);
			queryClient.setQueryData(SESSION_KEY, session.user);
			useSignUpFlowStore.getState().reset();
			router.push(`/auth/verified?role=${session.user.role.toLowerCase()}`);
		},
		onError: (error) => {
			toast.error(
				error instanceof MissingEmailError
					? "We lost track of your email. Please sign up again."
					: getApiErrorMessage(error, undefined, {
							400: "That code is invalid or has expired. Check it, or request a new one.",
							404: "We couldn't find an account for that email. Please sign up again.",
						}),
			);
		},
	});
}

/** `POST /auth/resend-otp` `{ email }` — always answers 200 (so it can't be used to probe which emails exist); 3 per 15 minutes per IP. */
function useResendOtp() {
	return useMutation({
		meta: { action: "auth.resend-otp" },
		mutationFn: async () => {
			const email = useSignUpFlowStore.getState().email;
			if (!email) throw new MissingEmailError();
			await axiosPublic.post(apiRoutes.auth.RESEND_OTP, { email });
			return { email };
		},
		onSuccess: () => {
			toast.success("A new code has been sent to your email");
		},
		onError: (error) => {
			toast.error(
				error instanceof MissingEmailError
					? "We lost track of your email. Please sign up again."
					: getApiErrorMessage(error),
			);
		},
	});
}

export { useResendOtp, useVerifyOtp };
