"use client";

import { useState } from "react";
import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/errorMessage";

const queryCache = new QueryCache({
	onError: (error, query) => {
		console.error(
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
		console.error(
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
