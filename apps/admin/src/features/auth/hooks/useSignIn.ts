import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { SESSION_KEY } from "@/features/auth/hooks/useSession";
import { axiosPublic } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { logAction } from "@/lib/logger";
import { useAuthStore } from "@/lib/stores/authStore";
import type { ApiSuccessResponse, AuthTokensData } from "@/lib/api/types";

export interface SignInValues {
	email: string;
	password: string;
}

/** Thrown when the credentials are right but the account isn't an admin's. */
class NotAdminError extends Error {
	constructor() {
		super("This account is not an admin");
	}
}

/**
 * `POST /auth/login` — the same endpoint everyone signs in with; the admin app only lets an
 * `ADMIN` account through. A client or provider who signs in here has their freshly issued
 * refresh token revoked again and is told this isn't their console. There is no way to create
 * the first admin over HTTP (the backend does it out-of-band), and no "remember me": the
 * refresh cookie is session-only, so closing the browser signs an admin out.
 */
function useSignIn() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "auth.sign-in" },
		mutationFn: async (values: SignInValues) => {
			const { data } = await axiosPublic.post<ApiSuccessResponse<AuthTokensData>>(apiRoutes.auth.LOGIN, values);
			const session = data.data;
			if (session.user.role !== "ADMIN") {
				// Not for this app: undo the session the backend just issued.
				axiosPublic.post(apiRoutes.auth.LOGOUT, { refresh_token: session.refresh_token }).catch(() => undefined);
				throw new NotAdminError();
			}
			return session;
		},
		onSuccess: (session) => {
			useAuthStore.getState().setTokens(session, { remember: false });
			queryClient.setQueryData(SESSION_KEY, session.user);
			logAction("auth.sign-in", "info", { role: session.user.role });
			router.push("/dashboard");
		},
		onError: (error) => {
			if (error instanceof NotAdminError) {
				toast.error("That account isn't an admin account. This console is for Gwani staff.");
				return;
			}
			if (isAxiosError(error) && error.response?.status === 403) {
				toast.error("This account has been suspended.");
				return;
			}
			toast.error(getApiErrorMessage(error, undefined, { 401: "Invalid email or password." }));
		},
	});
}

export { useSignIn };
