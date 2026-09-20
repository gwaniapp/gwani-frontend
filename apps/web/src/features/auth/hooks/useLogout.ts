import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useMockSessionStore } from "@/lib/stores/mockSessionStore";

/**
 * Drops the session and goes to sign-in. Today that's clearing the token store
 * and the mock session; with real auth it should also revoke the refresh token
 * (`POST /auth/logout`). `onDone` runs first, e.g. to close a menu.
 */
function useLogout(onDone?: () => void) {
	const router = useRouter();
	const clearSession = useAuthStore((state) => state.clear);

	return function logout() {
		clearSession();
		useMockSessionStore.getState().clear();
		onDone?.();
		router.push("/auth/sign-in");
	};
}

export { useLogout };
