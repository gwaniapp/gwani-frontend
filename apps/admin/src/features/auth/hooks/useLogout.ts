import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { axiosPublic } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { logAction } from "@/lib/logger";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Signs out: revokes the refresh token on the backend (`POST /auth/logout`,
 * 204), drops the local tokens, empties the query cache (so the next person on
 * this browser can't see cached data) and goes to sign-in. The revoke is best
 * effort (retried once after 2s) — if it still fails the local sign-out still
 * happens, since the token is discarded either way (the server-side token then
 * simply lives until it expires). `onDone` runs first, e.g. to close a menu.
 */
function useLogout(onDone?: () => void) {
	const router = useRouter();
	const queryClient = useQueryClient();

	return function logout() {
		logAction("auth.sign-out", "start");
		const refreshToken = useAuthStore.getState().refreshToken;
		if (refreshToken) {
			const revoke = () => axiosPublic.post(apiRoutes.auth.LOGOUT, { refresh_token: refreshToken });
			revoke()
				.catch(() => new Promise((resolve) => setTimeout(resolve, 2000)).then(revoke)) // one retry: a gateway blip is common
				.then(() => logAction("auth.sign-out", "info", { revoked: true }))
				.catch(() => logAction("auth.sign-out", "info", { revoked: false, note: "backend revoke failed; signed out locally anyway" }));
		}
		useAuthStore.getState().clear();
		queryClient.clear();
		onDone?.();
		logAction("auth.sign-out", "success");
		router.push("/auth/sign-in");
	};
}

export { useLogout };
