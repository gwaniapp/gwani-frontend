import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/lib/api/types";

/**
 * NestJS's default messages when nothing more specific was thrown ("Unauthorized
 * Exception", "Bad Request Exception", ...) — accurate but useless on screen,
 * so they're replaced by the status-based wording below.
 */
const GENERIC_BACKEND_MESSAGE = /^(bad request|unauthorized|forbidden|not found|conflict|too many requests|internal server error|service unavailable)( exception)?$/i;

const STATUS_MESSAGES: Record<number, string> = {
	400: "Some of the details aren't valid. Please check them and try again.",
	401: "Your session has expired. Please sign in again.",
	403: "You don't have permission to do that.",
	404: "We couldn't find what you were looking for.",
	409: "That already exists.",
	429: "Too many attempts. Please wait a few minutes and try again.",
};

/** Field-level messages from a `VALIDATION_ERROR` body's `meta.issues`, when they carry any. */
function issueMessages(issues: unknown): string[] {
	if (!Array.isArray(issues)) return [];
	return issues
		.map((issue) => (issue && typeof issue === "object" && "message" in issue ? String((issue as { message: unknown }).message) : ""))
		.filter(Boolean);
}

/**
 * Turns whatever a request threw into a sentence a person can act on. The real
 * backend's error body is `{ statusCode, message, error: CODE, meta: { issues? } }`
 * (confirmed live). Order: a caller's own wording for that status, then field
 * issues, then the backend's message if it says something specific, then a
 * status default, then `fallback`. `overrides` is keyed by HTTP status — e.g.
 * sign-in says 401 means "Invalid email or password", not "session expired".
 */
function getApiErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
	overrides: Partial<Record<number, string>> = {},
) {
	if (!isAxiosError<Partial<ApiErrorResponse>>(error)) return fallback;

	// No response at all: the request never reached the app's own proxy.
	if (!error.response) {
		return error.code === "ECONNABORTED"
			? "That took too long. Please try again."
			: "Can't reach the server. Check your connection and try again.";
	}

	const { status, data } = error.response;
	const override = overrides[status];
	if (override) return override;

	// The rate limiter's own text ("ThrottlerException: Too Many Requests") is framework noise.
	if (status === 429) return STATUS_MESSAGES[429] ?? fallback;

	// The proxy's own 502/504 bodies already carry a friendly message.
	if (status >= 500) {
		return status === 502 || status === 504 ? (data?.message ?? fallback) : "Something went wrong on our side. Please try again in a moment.";
	}

	const issues = issueMessages(data?.meta?.issues);
	if (issues.length > 0) return issues.join(" ");

	const message = data?.message;
	if (typeof message === "string" && message && !GENERIC_BACKEND_MESSAGE.test(message)) return message;
	if (Array.isArray(message) && message.length > 0) return message.join(" ");

	return STATUS_MESSAGES[status] ?? fallback;
}

/** The backend's machine-readable error code (`INVALID_CREDENTIALS`, ...), if the error has one. */
function getApiErrorCode(error: unknown): string | undefined {
	return isAxiosError<Partial<ApiErrorResponse>>(error) ? error.response?.data?.error : undefined;
}

export { getApiErrorCode, getApiErrorMessage };
