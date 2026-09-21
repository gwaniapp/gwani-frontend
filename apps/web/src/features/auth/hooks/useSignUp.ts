import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { axiosPublic } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { useSignUpFlowStore } from "@/lib/stores/signUpFlowStore";
import type { SignUpRole } from "@/lib/api/types";
import type { SignUpValues } from "@/lib/validations/authValidations";

/**
 * `POST /auth/signup` — creates the account and emails a 6-digit OTP; nothing
 * is logged in yet (that happens on `verify-otp`). Stores the email and role
 * for the next steps, then moves on to the OTP step. The backend allows 5
 * sign-ups per hour per IP (429 past that).
 */
function useSignUp(role: SignUpRole) {
	const router = useRouter();
	const setEmail = useSignUpFlowStore((state) => state.setEmail);
	const setRole = useSignUpFlowStore((state) => state.setRole);

	return useMutation({
		meta: { action: "auth.sign-up" },
		mutationFn: async (values: SignUpValues) => {
			await axiosPublic.post(apiRoutes.auth.SIGNUP, {
				email: values.email,
				password: values.password,
				first_name: values.firstName,
				last_name: values.lastName,
				role,
			});
			return { email: values.email, role };
		},
		onSuccess: (_data, values) => {
			setEmail(values.email);
			setRole(role);
			toast.success("Account created. Check your email for a verification code.");
			router.push("/auth/verify-otp");
		},
		onError: (error) => {
			toast.error(
				getApiErrorMessage(error, undefined, { 409: "An account with this email already exists. Try signing in instead." }),
			);
		},
	});
}

export { useSignUp };
