import { useQuery } from "@tanstack/react-query";
import { axiosAuth } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { useAuthStore } from "@/lib/stores/authStore";
import type { ApiSuccessResponse, User } from "@/lib/api/types";

const SESSION_KEY = ["session", "me"];

/** `GET /users/me` — the authenticated user's own profile. `role` rides
 * along here, so nothing else needs to re-derive "is this a provider" —
 * check `user.role === "PROVIDER"`. */
function useSession(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: SESSION_KEY,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<User>>(apiRoutes.users.ME);
			return data.data;
		},
		enabled: options?.enabled,
	});
}

type CurrentUser =
	| { status: "loading"; user?: undefined; retry?: undefined }
	| { status: "unauthenticated"; user?: undefined; retry?: undefined }
	| { status: "error"; user?: undefined; retry: () => void }
	| { status: "authenticated"; user: User; retry?: undefined };

/**
 * Who is signed in, as one of four states — what every guard and every screen
 * that shows the user's name should read:
 *
 * - `loading`: cookies not read yet, or an expired access token is being
 *   refreshed, or `GET /users/me` is in flight;
 * - `unauthenticated`: no tokens at all (or the refresh was rejected);
 * - `error`: signed in but the profile couldn't be loaded (network, 5xx) —
 *   `retry()` tries again;
 * - `authenticated`: `user` is set.
 *
 * Sign-in and OTP verification seed the cache with the `user` they return, so
 * the first dashboard render doesn't wait on a second request.
 */
function useCurrentUser(): CurrentUser {
	const isInitialized = useAuthStore((state) => state.isInitialized);
	const accessToken = useAuthStore((state) => state.accessToken);
	const refreshToken = useAuthStore((state) => state.refreshToken);
	const query = useSession({ enabled: isInitialized && Boolean(accessToken) });

	if (!isInitialized) return { status: "loading" };
	if (!accessToken && !refreshToken) return { status: "unauthenticated" };
	if (query.data) return { status: "authenticated", user: query.data };
	if (query.isError) return { status: "error", retry: () => void query.refetch() };
	return { status: "loading" };
}

export { SESSION_KEY, useCurrentUser, useSession };
