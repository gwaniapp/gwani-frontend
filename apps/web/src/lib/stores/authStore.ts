import { create } from "zustand";
import Cookies from "js-cookie";
import type { AuthTokensData, RefreshTokensData } from "@/lib/api/types";

// Exported (unlike the internal cookie handling below) so `lib/config/axios.ts`
// can read them straight off `document.cookie` itself — the refresh flow
// needs the *live* cookie value, not whatever this module's in-memory state
// last cached.
export const ACCESS_TOKEN_COOKIE = "gw_access_token";
export const REFRESH_TOKEN_COOKIE = "gw_refresh_token";

// The backend doesn't document an access-token lifetime beyond "short-lived"
// — 15 minutes is a conservative default; the cookie just needs to outlive
// the JWT by a little so a 401 (not a missing cookie) is what triggers
// refresh. Refresh token is "long-lived" per the docs, undocumented exact
// value — 30 days is a reasonable default, revisit once confirmed.
const ACCESS_TOKEN_TTL_MINUTES = 15;
const REFRESH_TOKEN_TTL_DAYS = 30;

// The API is a separate origin (fronted by our own same-origin proxy — see
// src/app/api/proxy) with no way to set httpOnly cookies for us, so tokens
// live in a cookie this app can read itself to attach the Authorization
// header — see lib/config/axios.ts's request interceptor.
const cookieOptions = { secure: true, sameSite: "strict" as const };

/**
 * The real, backend-issued session. Cookie-backed rather than zustand's
 * `persist` middleware so `lib/config/axios.ts`'s interceptors — which run
 * outside React, with no store-hydration lifecycle — can always read the
 * latest tokens straight off `document.cookie`.
 *
 * Unlike peakline's `authStore`, no role/profile caching dance is needed
 * here: `AuthTokensData.user` already carries the full `role` on every
 * login/signup/verify-otp response (confirmed live), and it's immutable
 * once set — so the full `User` object lives in TanStack Query's cache via
 * `GET /users/me` (see `features/auth/hooks/useSession.ts`), not duplicated
 * into this store. This store only ever needs to answer "is there a
 * session at all".
 */
interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	/** False until `initializeAuth` has run once on mount — lets a route
	 * guard tell "not logged in" apart from "haven't checked cookies yet". */
	isInitialized: boolean;
	setTokens: (tokens: AuthTokensData | RefreshTokensData) => void;
	/** Drops the whole session — used on real logout, and internally when a
	 * refresh attempt itself gets rejected (nothing left to retry with). */
	clear: () => void;
	/** Hydrates state from the cookies — call once on mount (see
	 * `AuthProvider`); cookies aren't readable during SSR, so the store
	 * starts unauthenticated on both the server and the first client render
	 * to avoid a hydration mismatch. */
	initializeAuth: () => void;
}

const persistTokens = (tokens: AuthTokensData | RefreshTokensData) => {
	Cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
		...cookieOptions,
		expires: ACCESS_TOKEN_TTL_MINUTES / (24 * 60),
	});
	Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
		...cookieOptions,
		expires: REFRESH_TOKEN_TTL_DAYS,
	});
};

const clearCookies = () => {
	Cookies.remove(ACCESS_TOKEN_COOKIE);
	Cookies.remove(REFRESH_TOKEN_COOKIE);
};

const useAuthStore = create<AuthState>((set) => ({
	accessToken: null,
	refreshToken: null,
	isAuthenticated: false,
	isInitialized: false,

	setTokens: (tokens) => {
		persistTokens(tokens);
		set({
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			isAuthenticated: true,
		});
	},

	clear: () => {
		clearCookies();
		set({ accessToken: null, refreshToken: null, isAuthenticated: false });
	},

	initializeAuth: () => {
		const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;
		const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE) ?? null;

		set({
			accessToken,
			refreshToken,
			isAuthenticated: Boolean(accessToken),
			isInitialized: true,
		});
	},
}));

export { useAuthStore };
