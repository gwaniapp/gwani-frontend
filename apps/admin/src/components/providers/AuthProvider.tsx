"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { refreshSession } from "@/lib/config/axios";

/**
 * Hydrates the auth store from the token cookies on first client render.
 * Cookies aren't readable during SSR, so the store's initial state is
 * unauthenticated on both the server and the first client render (avoiding
 * a hydration mismatch) — this patches in the real value right after mount.
 *
 * Also proactively refreshes if the access-token cookie has already expired
 * (it's set to die a little before the JWT itself does — see `authStore`'s
 * `persistTokens`) but a refresh token is still around, rather than waiting
 * for whatever request happens to fire first to 401 — avoids a session
 * briefly reading as logged out purely because of when, not whether, the
 * tab happened to reload.
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
	const initializeAuth = useAuthStore((state) => state.initializeAuth);

	useEffect(() => {
		initializeAuth();
		const { accessToken, refreshToken } = useAuthStore.getState();
		if (!accessToken && refreshToken) {
			refreshSession();
		}
	}, [initializeAuth]);

	return <>{children}</>;
}

export { AuthProvider };
