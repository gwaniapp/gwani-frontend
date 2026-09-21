import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

/**
 * Stand-in for a network call while an endpoint isn't wired up yet — resolves
 * (or rejects, if `outcome` is an Error) after a short delay, so loading and
 * error states behave like the real thing. Swap the `mutationFn` that uses
 * this for the real axios call; nothing else about the caller changes.
 */
function simulateRequest<T>(outcome: T | Error, delayMs = 900): Promise<T> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			if (outcome instanceof Error) reject(outcome);
			else resolve(outcome);
		}, delayMs);
	});
}

/**
 * An error shaped exactly like a real backend rejection (an `AxiosError` with
 * the backend's error body), so `getApiErrorMessage` and the 4xx-as-warning
 * logging treat a simulated failure the same as a real one.
 */
function simulatedApiError(status: number, message: string) {
	const response = {
		status,
		statusText: "",
		headers: {},
		config: {} as InternalAxiosRequestConfig,
		data: { statusCode: status, message, error: "Bad Request" },
	} satisfies AxiosResponse;
	return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, undefined, undefined, response);
}

export { simulateRequest, simulatedApiError };
