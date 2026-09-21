"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { QueryCache, QueryClient, QueryClientProvider, MutationCache, type Mutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { logAction } from "@/lib/logger";

// 4xx responses are expected, user-facing failures (wrong password, email
// already taken, ...) — a warning, so they don't trip Next's dev-mode
// "Issue" overlay on every one. Real bugs (5xx, network errors, thrown
// non-HTTP errors) still get `console.error`. Same split `lib/config/axios.ts`
// makes for its own request logging.
function logFor(error: unknown) {
	const status = isAxiosError(error) ? error.response?.status : undefined;
	return typeof status === "number" && status >= 400 && status < 500 ? console.warn : console.error;
}

/** Every mutation names its action with `meta: { action: "auth.sign-in" }`; that's what the log shows. */
function actionName(mutation: Mutation<unknown, unknown, unknown, unknown>) {
	const named = mutation.meta?.action;
	if (typeof named === "string") return named;
	return mutation.options.mutationKey ? JSON.stringify(mutation.options.mutationKey) : "(unnamed action)";
}

const queryCache = new QueryCache({
	onError: (error, query) => {
		logFor(error)(
			`%c[query] %c${JSON.stringify(query.queryKey)}`,
			"color:#dc2626;font-weight:600",
			"color:inherit",
			"—",
			getApiErrorMessage(error, error instanceof Error ? error.message : "Unknown error"),
			error,
		);
	},
});

// Every action, start to finish. The request itself is logged separately by
// the axios interceptors ([api:...]); these lines say *what the user did*.
const mutationCache = new MutationCache({
	onMutate: (variables, mutation) => {
		logAction(actionName(mutation), "start", variables);
	},
	onSuccess: (data, _variables, _context, mutation) => {
		logAction(actionName(mutation), "success", data);
	},
	onError: (error, _variables, _context, mutation) => {
		const status = isAxiosError(error) ? error.response?.status : undefined;
		logAction(actionName(mutation), "error", {
			status,
			message: getApiErrorMessage(error, error instanceof Error ? error.message : "Unknown error"),
		});
		logFor(error)(
			`%c[mutation] %c${actionName(mutation)}`,
			"color:#dc2626;font-weight:600",
			"color:inherit",
			"—",
			error,
		);
	},
});

function ReactQueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache,
				mutationCache,
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						retry: 1,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { ReactQueryProvider };
