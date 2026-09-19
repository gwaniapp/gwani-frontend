import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { axiosPublic } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { MOCK_AUTH, simulatedApiError, simulateRequest } from "@/lib/simulation";
import { useSignUpFlowStore } from "@/lib/stores/signUpFlowStore";
import type { SignUpRole } from "@/lib/api/types";
import type { SignUpValues } from "@/lib/validations/authValidations";

const TAKEN_EMAIL = "taken@example.com";

/**
 * `POST /auth/signup` — creates the account and emails a 6-digit OTP; nothing
 * is logged in yet (that happens on `verify-otp`). Stores the email and role
 * for the next steps, then moves on to the OTP step.
 */
function useSignUp(role: SignUpRole) {
	const router = useRouter();
	const setEmail = useSignUpFlowStore((state) => state.setEmail);
	const setRole = useSignUpFlowStore((state) => state.setRole);

	return useMutation({
		mutationFn: async (values: SignUpValues) => {
			if (MOCK_AUTH) {
				// `taken@example.com` fails, to exercise the error state.
				await simulateRequest(
					values.email.toLowerCase() === TAKEN_EMAIL
						? simulatedApiError(409, "An account with this email already exists")
						: true,
				);
				return;
			}
			await axiosPublic.post(apiRoutes.auth.SIGNUP, {
				email: values.email,
				password: values.password,
				first_name: values.firstName,
				last_name: values.lastName,
				role,
			});
		},
		onSuccess: (_data, values) => {
			setEmail(values.email);
			setRole(role);
			toast.success("Account created — check your email for a verification code");
			router.push("/auth/verify-otp");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	});
}

export { useSignUp };
