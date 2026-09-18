import { isAxiosError } from "axios";

/**
 * Generic shape assumed for a backend error body until the real API's
 * error contract is known — a `message` string or array (common on
 * NestJS/class-validator-style backends) is read if present, otherwise the
 * fallback is used untouched. Narrow this once the real backend exists.
 */
interface ApiErrorResponse {
	message?: string | string[];
}

function getApiErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
) {
	if (isAxiosError<ApiErrorResponse>(error)) {
		const message = error.response?.data?.message;
		if (Array.isArray(message)) {
			return message.length > 0 ? message.join(" ") : fallback;
		}
		if (typeof message === "string" && message) return message;
	}
	return fallback;
}

export { getApiErrorMessage };
