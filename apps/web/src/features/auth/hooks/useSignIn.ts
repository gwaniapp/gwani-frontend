import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { simulatedApiError, simulateRequest } from "@/lib/simulation";
import type { SignInValues } from "@/lib/validations/authValidations";

/** Signs in as this address fail, to exercise the error state. */
const WRONG_CREDENTIALS_EMAIL = "wrong@example.com";

/**
 * SIMULATED — not wired to `POST /auth/login` yet. To go live: post
 * `{ email, password }`, unwrap the `{ access_token, refresh_token, user }`
 * envelope, store the tokens with `useAuthStore.setTokens` (and let
 * `rememberMe` decide whether they outlive the session — `authStore` currently
 * always sets a 30-day refresh cookie), then route by `user.role`. Unverified
 * accounts get a 403 from the backend and should be sent to the OTP step.
 */
function useSignIn() {
	const router = useRouter();

	return useMutation({
		mutationFn: (values: SignInValues) =>
			simulateRequest(
				values.email.toLowerCase() === WRONG_CREDENTIALS_EMAIL
					? simulatedApiError(401, "Invalid email or password")
					: true,
			),
		onSuccess: () => {
			// No dashboards exist yet, so signing in lands on the home page.
			router.push("/");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});
}

export { useSignIn };
