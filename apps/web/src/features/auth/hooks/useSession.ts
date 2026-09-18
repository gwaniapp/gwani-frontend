import { useQuery } from "@tanstack/react-query";
import { axiosAuth } from "@/lib/config/axios";
import { apiRoutes } from "@/lib/config/apiRoutes";
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

export { useSession, SESSION_KEY };
