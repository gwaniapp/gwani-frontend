import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { simulatedApiError, simulateRequest } from "@/lib/simulation";
import { useSignUpFlowStore } from "@/lib/stores/signUpFlowStore";
import type { VerifyOtpValues } from "@/lib/validations/authValidations";

/**
 * SIMULATED — not wired to `POST /auth/verify-otp` yet. Any 6-digit code
 * succeeds except `000000`, which fails so the error state can be exercised.
 * To go live: swap the `mutationFn` body for
 * `axiosPublic.post(apiRoutes.auth.VERIFY_OTP, { email, otp: values.code })`,
 * store the returned tokens with `useAuthStore.setTokens`, and route by role.
 */
const INVALID_CODE = "000000";

function useVerifyOtp() {
	const router = useRouter();
	const resetFlow = useSignUpFlowStore((state) => state.reset);

	return useMutation({
		mutationFn: (values: VerifyOtpValues) =>
			simulateRequest(
				values.code === INVALID_CODE ? simulatedApiError(400, "Invalid or expired OTP") : true,
			),
		onSuccess: () => {
			// Read before resetting; a direct visit (no stored role) previews the provider version.
			const role = useSignUpFlowStore.getState().role ?? "PROVIDER";
			resetFlow();
			router.push(`/auth/verified?role=${role.toLowerCase()}`);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});
}

/** SIMULATED — the real call is `POST /auth/resend-otp` with `{ email }`. */
function useResendOtp() {
	return useMutation({
		mutationFn: () => simulateRequest(true, 700),
		onSuccess: () => {
			toast.success("A new code has been sent to your email");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});
}

export { useVerifyOtp, useResendOtp };
