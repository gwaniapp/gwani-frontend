import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { dashboardHomeFor } from "@/features/dashboard/config";
import { simulatedApiError, simulateRequest } from "@/lib/simulation";
import { useMockSessionStore } from "@/lib/stores/mockSessionStore";
import type { UserRole } from "@/lib/api/types";
import type { SignInValues } from "@/lib/validations/authValidations";

/** Signs in as this address fail, to exercise the error state. */
const WRONG_CREDENTIALS_EMAIL = "wrong@example.com";

/** The mock has no accounts, so the role comes from the address: `client…@` signs in as a client, anything else as a provider. */
function mockRoleFor(email: string): UserRole {
	return email.toLowerCase().startsWith("client") ? "CLIENT" : "PROVIDER";
}

/**
 * SIMULATED — not wired to `POST /auth/login` yet. To go live: post
 * `{ email, password }`, unwrap the `{ access_token, refresh_token, user }`
 * envelope, store the tokens with `useAuthStore.setTokens` (and let
 * `rememberMe` decide whether they outlive the session — `authStore` currently
 * always sets a 30-day refresh cookie), then route by `user.role` (
 * `dashboardHomeFor`) instead of the mock role below. Unverified
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
		onSuccess: (_data, values) => {
			const role = mockRoleFor(values.email);
			useMockSessionStore.getState().setRole(role);
			router.push(dashboardHomeFor(role) ?? "/");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});
}

export { useSignIn };
