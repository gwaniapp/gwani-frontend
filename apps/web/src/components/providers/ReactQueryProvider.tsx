"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/errorMessage";

// 4xx responses are expected, user-facing failures (wrong password, email
// already taken, ...) — a warning, so they don't trip Next's dev-mode
// "Issue" overlay on every one. Real bugs (5xx, network errors, thrown
// non-HTTP errors) still get `console.error`. Same split `lib/config/axios.ts`
// makes for its own request logging.
function logFor(error: unknown) {
	const status = isAxiosError(error) ? error.response?.status : undefined;
	return typeof status === "number" && status >= 400 && status < 500 ? console.warn : console.error;
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

const mutationCache = new MutationCache({
	onError: (error, _variables, _context, mutation) => {
		const label = mutation.options.mutationKey
			? JSON.stringify(mutation.options.mutationKey)
			: "(unkeyed)";
		logFor(error)(
			`%c[mutation] %c${label}`,
			"color:#dc2626;font-weight:600",
			"color:inherit",
			"—",
			getApiErrorMessage(error, error instanceof Error ? error.message : "Unknown error"),
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
