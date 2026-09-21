/**
 * Console log for every user-facing action, dev only (same rule as the API
 * request logging in `lib/config/axios.ts`). Every mutation is logged
 * automatically by the query provider using its `meta.action` name; call
 * `logAction` directly for things that aren't mutations (sign-out, a guard
 * redirecting, a token refresh, ...).
 *
 * Secrets never reach the console: passwords, OTP codes and tokens are masked
 * wherever they appear in the logged data.
 */
type Phase = "start" | "success" | "error" | "info";

const SECRET_KEYS = new Set(["password", "currentPassword", "newPassword", "otp", "code", "access_token", "refresh_token", "accessToken", "refreshToken"]);

function redact(value: unknown, depth = 0): unknown {
	if (value === null || typeof value !== "object" || depth > 4) return value;
	if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, SECRET_KEYS.has(key) ? "••••••" : redact(item, depth + 1)]),
	);
}

const STYLE: Record<Phase, string> = {
	start: "color:#3231C6;font-weight:600",
	success: "color:#16a34a;font-weight:600",
	error: "color:#dc2626;font-weight:600",
	info: "color:#9B9B9B;font-weight:600",
};

function logAction(action: string, phase: Phase, detail?: unknown) {
	if (process.env.NODE_ENV === "production") return;
	// Expected failures (4xx) come through as `error` with a status; the caller
	// decides — `warn` keeps them from tripping Next's dev "Issue" overlay.
	const log = phase === "error" ? console.warn : console.log;
	if (detail === undefined) log(`%c[action] %c${action} %c${phase}`, "color:#9B9B9B", "color:inherit", STYLE[phase]);
	else log(`%c[action] %c${action} %c${phase}`, "color:#9B9B9B", "color:inherit", STYLE[phase], redact(detail));
}

export { logAction };
