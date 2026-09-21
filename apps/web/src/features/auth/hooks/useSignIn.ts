import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { dashboardHomeFor } from "@/features/dashboard/config";
import { SESSION_KEY } from "@/features/auth/hooks/useSession";
import { axiosPublic } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api/errorMessage";
import { logAction } from "@/lib/logger";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSignUpFlowStore } from "@/lib/stores/signUpFlowStore";
import type { ApiSuccessResponse, AuthTokensData } from "@/lib/api/types";
import type { SignInValues } from "@/lib/validations/authValidations";

/**
 * A 403 from login means "email not verified yet" *or* "account suspended" —
 * one status, two cases. The body's `error` code / message tell them apart;
 * the exact code isn't documented, so this matches on the wording and logs the
 * code it saw so it can be pinned down against the first real case.
 */
function isUnverified(error: unknown) {
	if (!isAxiosError(error)) return false;
	const text = `${getApiErrorCode(error) ?? ""} ${error.response?.data?.message ?? ""}`;
	return /verif/i.test(text) && !/suspend/i.test(text);
}

/**
 * `POST /auth/login` `{ email, password }` → `{ access_token, refresh_token, user }`.
 * The tokens go into the cookie store (`rememberMe` decides whether the refresh
 * token outlives the browser session), the user into the session cache, and the
 * person lands on their role's dashboard. An unverified account is sent to the
 * OTP step with a fresh code. 10 attempts per 15 minutes per IP.
 */
function useSignIn() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "auth.sign-in" },
		mutationFn: async (values: SignInValues) => {
			const { data } = await axiosPublic.post<ApiSuccessResponse<AuthTokensData>>(apiRoutes.auth.LOGIN, {
				email: values.email,
				password: values.password,
			});
			return { session: data.data, remember: values.rememberMe };
		},
		onSuccess: ({ session, remember }) => {
			useAuthStore.getState().setTokens(session, { remember });
			queryClient.setQueryData(SESSION_KEY, session.user);
			const home = dashboardHomeFor(session.user.role);
			logAction("auth.sign-in", "info", { role: session.user.role, redirect: home ?? "/auth/sign-in (no dashboard for this role)" });
			router.push(home ?? "/auth/sign-in");
		},
		onError: async (error, values) => {
			if (isAxiosError(error) && error.response?.status === 403) {
				logAction("auth.sign-in", "info", { forbidden: getApiErrorCode(error), message: error.response.data?.message });
				if (isUnverified(error)) {
					// Carry them to the OTP step and send a fresh code — the original may be long gone.
					useSignUpFlowStore.getState().setEmail(values.email);
					axiosPublic.post(apiRoutes.auth.RESEND_OTP, { email: values.email }).catch(() => undefined);
					toast.info("Verify your email to continue. We've sent you a new code.");
					router.push("/auth/verify-otp");
					return;
				}
				toast.error("This account has been suspended. Contact support if you think that's a mistake.");
				return;
			}
			toast.error(getApiErrorMessage(error, undefined, { 401: "Invalid email or password." }));
		},
	});
}

export { useSignIn };
