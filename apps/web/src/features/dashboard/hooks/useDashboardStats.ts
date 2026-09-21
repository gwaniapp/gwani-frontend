import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import type { ApiSuccessResponse, ClientDashboardStats, ProviderDashboardStats } from "@/lib/api/types";

/**
 * `GET /providers/provider/dashboard/stats` — the provider overview's four numbers,
 * counted by the server: active jobs (PROVIDER_SELECTED / FUNDED / IN_PROGRESS),
 * completed (PAID), pending payments (COMPLETED, awaiting release — a *count*) and
 * the reputation score. A brand-new provider without a profile gets a 404, which is
 * "no stats yet" (`null`), not an error. Re-fetched every 30s so job changes show.
 */
function useProviderStats() {
	return useQuery({
		queryKey: ["dashboard", "stats", "provider"],
		staleTime: 0,
		refetchOnMount: "always",
		refetchInterval: 30_000,
		retry: false,
		queryFn: async (): Promise<ProviderDashboardStats | null> => {
			try {
				const { data } = await axiosAuth.get<ApiSuccessResponse<ProviderDashboardStats>>(apiRoutes.providers.DASHBOARD_STATS);
				return data.data;
			} catch (error) {
				if (isAxiosError(error) && error.response?.status === 404) return null;
				throw error;
			}
		},
	});
}

/**
 * `GET /jobs/client/dashboard/stats` — the client overview's three numbers, counted
 * by the server: active jobs (posted and not yet PAID, excluding DISPUTED/CANCELLED),
 * completed (PAID) and total spent (sum of PAID jobs, a decimal string).
 */
function useClientStats() {
	return useQuery({
		queryKey: ["dashboard", "stats", "client"],
		staleTime: 0,
		refetchOnMount: "always",
		refetchInterval: 30_000,
		retry: false,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<ClientDashboardStats>>(apiRoutes.jobs.CLIENT_DASHBOARD_STATS);
			return data.data;
		},
	});
}

export { useClientStats, useProviderStats };
