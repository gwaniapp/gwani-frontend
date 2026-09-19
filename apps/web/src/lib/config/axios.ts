import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, useAuthStore } from "@/lib/stores/authStore";
import { apiRoutes } from "@/lib/config/apiRoutes";
import type { ApiSuccessResponse, RefreshTokensData } from "@/lib/api/types";

// Same-origin proxy (see src/app/api/proxy/[...path]/route.ts) — the real
// API (Railway-hosted) has no CORS headers for browser-origin requests
// (confirmed live: an OPTIONS preflight against it returns no
// `access-control-allow-origin` at all), so the browser only ever talks to
// this same-origin path; the proxy forwards server-side where CORS doesn't
// apply.
const PROXY_BASE_URL = "/api/proxy";

// Longer than the proxy route's own `UPSTREAM_TIMEOUT_MS` (20s) on purpose —
// that timeout should always fire first and hand back a real, backend-shaped
// 504 body, with this one only as a last-resort backstop for the proxy
// itself hanging.
const REQUEST_TIMEOUT_MS = 25_000;

// No auth header — signup/login/verify-otp/resend-otp/forgot-password/
// reset-password, and the token refresh call itself (must not go through
// axiosAuth, or a failed refresh would loop).
export const axiosPublic = axios.create({
	baseURL: PROXY_BASE_URL,
	headers: { "Content-Type": "application/json" },
	timeout: REQUEST_TIMEOUT_MS,
});

// Attaches the bearer token and retries once with a refreshed token on 401.
export const axiosAuth = axios.create({
	baseURL: PROXY_BASE_URL,
	headers: { "Content-Type": "application/json" },
	timeout: REQUEST_TIMEOUT_MS,
});

// ---------------------------------------------------------------------
// Console logging for every API call, success or error — dev-only. Every
// request this app makes goes through axiosPublic/axiosAuth, so hooking
// logging in here covers the whole app.
// ---------------------------------------------------------------------
type TimedConfig = InternalAxiosRequestConfig & { __startedAt?: number };

const REDACTED_KEYS = ["password"];

const redact = (data: unknown) => {
	if (!data || typeof data !== "object") return data;
	const clone = { ...(data as Record<string, unknown>) };
	for (const key of REDACTED_KEYS) {
		if (key in clone) clone[key] = "••••••";
	}
	return clone;
};

const attachApiLogging = (instance: AxiosInstance, label: string) => {
	instance.interceptors.request.use((config) => {
		(config as TimedConfig).__startedAt = Date.now();
		console.log(
			`%c[api:${label}] -> ${(config.method ?? "get").toUpperCase()} ${config.url}`,
			"color:#9B9B9B",
		);
		return config;
	});

	instance.interceptors.response.use(
		(response) => {
			const config = response.config as TimedConfig;
			const duration = config.__startedAt ? Date.now() - config.__startedAt : undefined;

			console.groupCollapsed(
				`%c[api:${label}] <- %c${response.status} %c${(config.method ?? "get").toUpperCase()} ${config.url}%c ${duration ?? "?"}ms`,
				"color:#9B9B9B",
				"color:#16a34a;font-weight:600",
				"color:inherit",
				"color:#9B9B9B",
			);
			if (config.data) console.log("request:", redact(config.data));
			if (config.params) console.log("params:", config.params);
			console.log("response:", response.data);
			console.groupEnd();

			return response;
		},
		(error: AxiosError) => {
			const config = error.config as TimedConfig | undefined;
			const duration = config?.__startedAt ? Date.now() - config.__startedAt : undefined;
			const status = error.response?.status;
			const isTimeout = !error.response && error.code === "ECONNABORTED";
			const isNetworkError = !error.response && !isTimeout;
			const kind = isTimeout ? "TIMEOUT" : isNetworkError ? "NETWORK" : String(status ?? "ERR");

			// 4xx are expected, user-facing failures — log those as a warning so
			// they don't trip Next's dev-mode Console Error overlay on every
			// wrong-password attempt. Real bugs (5xx, timeouts, network errors)
			// still get the full console.error treatment.
			const isClientError = typeof status === "number" && status >= 400 && status < 500;
			const log = isClientError ? console.warn : console.error;

			console.groupCollapsed(
				`%c[api:${label}] xx %c${kind} %c${(config?.method ?? "?").toUpperCase()} ${config?.url ?? "unknown"}%c ${duration ?? "?"}ms`,
				"color:#9B9B9B",
				isClientError ? "color:#d97706;font-weight:600" : "color:#dc2626;font-weight:600",
				"color:inherit",
				"color:#9B9B9B",
			);
			if (config?.data) console.log("request:", redact(config.data));
			if (config?.params) console.log("params:", config.params);
			log(
				`[api:${label}] ${kind} ${(config?.method ?? "?").toUpperCase()} ${config?.url ?? "unknown"} (${duration ?? "?"}ms) — error:`,
				error.response?.data ?? error.message,
			);
			console.groupEnd();

			return Promise.reject(error);
		},
	);
};

if (process.env.NODE_ENV !== "production") {
	attachApiLogging(axiosPublic, "public");
	attachApiLogging(axiosAuth, "auth");
}

axiosAuth.interceptors.request.use((config) => {
	const token = useAuthStore.getState().accessToken;
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// Shared across concurrent 401s *in this tab* so a burst of requests
// triggers one refresh call instead of one per request.
let refreshPromise: Promise<string | null> | null = null;

// A plain localStorage key as a cross-tab mutex — two tabs sharing the same
// refresh-token cookie could otherwise both fire a refresh around the same
// time and race each other (the backend's `refresh` rotates the token,
// single-use, per its own docs). Short TTL so a tab that crashed mid-refresh
// can't wedge every other tab out indefinitely.
const REFRESH_LOCK_KEY = "gwani-refresh-lock";
const REFRESH_LOCK_TTL_MS = 10_000;

function acquireRefreshLock(): boolean {
	if (typeof window === "undefined") return true;
	try {
		const held = localStorage.getItem(REFRESH_LOCK_KEY);
		if (held && Date.now() - Number(held) < REFRESH_LOCK_TTL_MS) return false;
		localStorage.setItem(REFRESH_LOCK_KEY, String(Date.now()));
		return true;
	} catch {
		return true;
	}
}

function releaseRefreshLock() {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(REFRESH_LOCK_KEY);
	} catch {
		// Non-fatal — the lock just expires on its own via the TTL above.
	}
}

const refreshAccessToken = async (): Promise<string | null> => {
	// The live cookie, not `useAuthStore.getState().refreshToken` — cookies
	// are the one piece of storage every tab actually shares, so this is the
	// newest value regardless of which tab last rotated it.
	const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE) ?? null;
	if (!refreshToken) return null;

	if (!acquireRefreshLock()) {
		await new Promise((resolve) => setTimeout(resolve, 700));
		const rotatedAccessToken = Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;
		if (rotatedAccessToken) {
			useAuthStore.getState().initializeAuth();
			return rotatedAccessToken;
		}
		// It didn't finish (or it failed) in time — fall through and try this
		// tab's own request rather than giving up.
	}

	try {
		const { data } = await axiosPublic.post<ApiSuccessResponse<RefreshTokensData>>(apiRoutes.auth.REFRESH, {
			refresh_token: refreshToken,
		});
		useAuthStore.getState().setTokens(data.data);
		return data.data.access_token;
	} catch {
		// The refresh token itself was rejected — expired, or already revoked.
		// Nothing left to retry with.
		useAuthStore.getState().clear();
		return null;
	} finally {
		releaseRefreshLock();
	}
};

/** Exposed for `AuthProvider` to call proactively right after
 * `initializeAuth` — if the access-token cookie has already expired (it's
 * set to die a little before the JWT itself does — see `authStore`'s
 * `persistTokens`) but a refresh token is still around, there's no reason
 * to wait for a lazy 401 on whatever request fires first. */
export function refreshSession() {
	refreshPromise ??= refreshAccessToken().finally(() => {
		refreshPromise = null;
	});
	return refreshPromise;
}

axiosAuth.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;
			const newToken = await refreshSession();

			if (newToken) {
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return axiosAuth(originalRequest);
			}

			if (typeof window !== "undefined") {
				// A plain axios interceptor, not a React component — there's no
				// `useRouter()` available here, so a full navigation is the only
				// option.
				// eslint-disable-next-line @next/next/no-location-assign-relative-destination
				window.location.href = "/auth/sign-in";
			}
		}

		return Promise.reject(error);
	},
);
