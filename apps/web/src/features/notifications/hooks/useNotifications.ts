import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import { isUnread } from "@/lib/notifications";
import type { ApiSuccessResponse, AppNotification } from "@/lib/api/types";

const NOTIFICATIONS_KEY = ["notifications"] as const;

/**
 * `GET /notifications` — the latest 30 (the bell's list and its unread badge). There is no unread-count
 * endpoint, so the badge counts the unread ones in this page. Polled every 30s so a payment or a
 * status change turns up without a refresh; never served from cache.
 */
function useNotifications() {
	return useQuery({
		queryKey: NOTIFICATIONS_KEY,
		staleTime: 0,
		refetchInterval: 30_000,
		refetchOnWindowFocus: true,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<{ items?: AppNotification[] } | AppNotification[]>>(apiRoutes.notifications.BASE, {
				params: { page: 1, page_size: 30, order: "DESC" },
			});
			const payload = data.data;
			return Array.isArray(payload) ? payload : (payload?.items ?? []);
		},
	});
}

/** `PATCH /notifications/{id}/read` — sets `read_at` (idempotent). Marks it read in the list at once, then re-fetches. */
function useMarkRead() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "notifications.mark-read" },
		mutationFn: async (id: string) => {
			await axiosAuth.patch(apiRoutes.notifications.byIdRead(id));
			return id;
		},
		onSuccess: (id) => {
			queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (items) => items?.map((item) => (item.id === id && !item.read_at ? { ...item, read_at: new Date().toISOString() } : item)));
			void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
		},
	});
}

/** Marks every unread notification read (one PATCH each — the API has no bulk call). */
function useMarkAllRead() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "notifications.mark-all-read" },
		mutationFn: async (items: AppNotification[]) => {
			await Promise.all(items.filter(isUnread).map((item) => axiosAuth.patch(apiRoutes.notifications.byIdRead(item.id))));
		},
		onSettled: () => void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
		onError: (error) => toast.error(getApiErrorMessage(error, "We couldn't mark those as read. Please try again.")),
	});
}

/** `DELETE /notifications/{id}` — removes it from the inbox (a soft delete on the server). */
function useDeleteNotification() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "notifications.delete" },
		mutationFn: async (id: string) => {
			await axiosAuth.delete(apiRoutes.notifications.byId(id));
			return id;
		},
		onSuccess: (id) => {
			queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (items) => items?.filter((item) => item.id !== id));
			void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "We couldn't delete that notification.")),
	});
}

export { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications };
