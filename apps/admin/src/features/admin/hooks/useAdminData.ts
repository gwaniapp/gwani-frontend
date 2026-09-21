import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { readPage } from "@/lib/api/pagination";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import type { AdminJob, AdminStats, AdminUser, ApiSuccessResponse, AuditEntry, EscrowRecord, JobStatus, JobTransition, Page, UserRole } from "@/lib/api/types";

export const USERS_PAGE_SIZE = 15;
export const JOBS_PAGE_SIZE = 15;
export const AUDIT_PAGE_SIZE = 25;

const clean = (params: Record<string, string | number | undefined>) => Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));

/** `GET /admin/stats` — platform-wide counts and volume. Refreshed every minute. */
export function useAdminStats() {
	return useQuery({
		queryKey: ["admin", "stats"],
		refetchInterval: 60_000,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<AdminStats>>(apiRoutes.admin.STATS);
			return data.data;
		},
	});
}

export interface UserFilters {
	query: string;
	role: string;
	suspended: string;
	page: number;
}

/** `GET /admin/users` — search (email / first / last name), role, suspended and paging, all server-side. */
export function useAdminUsers(filters: UserFilters) {
	return useQuery({
		queryKey: ["admin", "users", filters],
		placeholderData: keepPreviousData,
		queryFn: async (): Promise<Page<AdminUser>> => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.admin.USERS, {
				params: clean({ query: filters.query.trim(), role: filters.role, suspended: filters.suspended, page: filters.page, page_size: USERS_PAGE_SIZE, order: "DESC" }),
			});
			return readPage<AdminUser>(data, filters.page, USERS_PAGE_SIZE);
		},
	});
}

export type UserAction =
	| { kind: "suspend" }
	| { kind: "unsuspend" }
	| { kind: "promote" }
	| { kind: "demote"; role: Exclude<UserRole, "ADMIN"> }
	| { kind: "erase" };

const ACTION_DONE: Record<UserAction["kind"], string> = {
	suspend: "Account suspended.",
	unsuspend: "Account reinstated.",
	promote: "Promoted to admin.",
	demote: "Admin role removed.",
	erase: "Personal data erased.",
};

const ACTION_ERRORS: Record<UserAction["kind"], Partial<Record<number, string>>> = {
	suspend: { 400: "An admin account can't be suspended. Remove their admin role first." },
	unsuspend: {},
	promote: { 400: "That user is already an admin." },
	demote: { 400: "That user isn't an admin." },
	erase: { 400: "An admin account can't be erased. Remove their admin role first." },
};

/**
 * The account actions on `/admin/users/{id}/…`: suspend, unsuspend, promote (→ ADMIN), demote
 * (→ CLIENT or PROVIDER, `{ role }`) and erase (`DELETE`: anonymises the person's data and soft-deletes
 * the account — irreversible). All answer 204 and are written to the audit log, so both the users and
 * the audit-log lists are refreshed afterwards.
 */
export function useUserAction(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "admin.user-action" },
		mutationFn: async (action: UserAction) => {
			switch (action.kind) {
				case "suspend":
					return axiosAuth.post(apiRoutes.admin.byUserIdSuspend(id));
				case "unsuspend":
					return axiosAuth.post(apiRoutes.admin.byUserIdUnsuspend(id));
				case "promote":
					return axiosAuth.post(apiRoutes.admin.byUserIdPromote(id));
				case "demote":
					return axiosAuth.post(apiRoutes.admin.byUserIdDemote(id), { role: action.role });
				case "erase":
					return axiosAuth.delete(apiRoutes.admin.byUserId(id));
			}
		},
		onSuccess: (_result, action) => {
			toast.success(ACTION_DONE[action.kind]);
			void queryClient.invalidateQueries({ queryKey: ["admin"] });
		},
	});
}

/** Words for a failed account action. */
export function userActionError(error: unknown, kind: UserAction["kind"]) {
	return getApiErrorMessage(error, "That didn't work. Please try again.", { ...ACTION_ERRORS[kind], 404: "That user no longer exists." });
}

/** `GET /admin/users/{id}/export` — every piece of personal data held for a user (a GDPR access request). The export itself is logged. */
export function useExportUser(id: string) {
	return useMutation({
		meta: { action: "admin.export-user" },
		mutationFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.admin.byUserIdExport(id));
			return data.data;
		},
	});
}

export interface JobFilters {
	status: string;
	page: number;
}

/** `GET /admin/jobs` — every job on the platform, by status, newest first. */
export function useAdminJobs(filters: JobFilters) {
	return useQuery({
		queryKey: ["admin", "jobs", filters],
		placeholderData: keepPreviousData,
		queryFn: async (): Promise<Page<AdminJob>> => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.admin.JOBS, {
				params: clean({ status: filters.status, page: filters.page, page_size: JOBS_PAGE_SIZE, order: "DESC" }),
			});
			return readPage<AdminJob>(data, filters.page, JOBS_PAGE_SIZE);
		},
	});
}

/** `GET /admin/disputes` — the jobs currently in DISPUTED, whose escrow release is frozen until an admin decides. */
export function useAdminDisputes() {
	return useQuery({
		queryKey: ["admin", "disputes"],
		refetchInterval: 60_000,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.admin.DISPUTES);
			return readPage<AdminJob>(data, 1, 100).items;
		},
	});
}

/** `GET /jobs/{id}/transitions` — the status history; for a dispute, the raiser's reason is in the note. */
export function useJobTransitions(id: string) {
	return useQuery({
		queryKey: ["admin", "job", id, "transitions"],
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<JobTransition[]>>(apiRoutes.jobs.byIdTransitions(id));
			return Array.isArray(data.data) ? data.data : [];
		},
	});
}

/** `GET /jobs/{id}/escrow` — the on-chain payment records (an admin may read any job's). */
export function useJobEscrow(id: string) {
	return useQuery({
		queryKey: ["admin", "job", id, "escrow"],
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<EscrowRecord[]>>(apiRoutes.jobs.byIdEscrow(id));
			return Array.isArray(data.data) ? data.data : [];
		},
	});
}

/**
 * `POST /admin/jobs/{id}/force-transition` `{ to, note? }` — overrides a job's status, bypassing the
 * normal rules: e.g. DISPUTED → PAID releases to the provider, DISPUTED → CANCELLED refunds the client.
 * The note (≤500) goes into the audit log and the job's history. 409 = the backend's admin rules don't allow that move.
 */
export function useForceTransition(id: string) {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "admin.force-transition" },
		mutationFn: async (values: { to: JobStatus; note?: string }) => {
			const { data } = await axiosAuth.post<ApiSuccessResponse<AdminJob>>(apiRoutes.admin.byJobIdForceTransition(id), {
				to: values.to,
				...(values.note ? { note: values.note } : {}),
			});
			return data.data;
		},
		onSuccess: () => {
			toast.success("Job status updated.");
			void queryClient.invalidateQueries({ queryKey: ["admin"] });
		},
	});
}

/** Words for a failed status change. */
export function forceTransitionError(error: unknown) {
	return getApiErrorMessage(error, "That didn't work. Please try again.", {
		409: "The backend doesn't allow that status change. Pick a different one.",
		404: "That job no longer exists.",
	});
}

export interface AuditFilters {
	action: string;
	targetType: string;
	page: number;
}

/** `GET /admin/audit-log` — every admin action, newest first, paged with `limit`/`offset` (there's no total). */
export function useAuditLog(filters: AuditFilters) {
	return useQuery({
		queryKey: ["admin", "audit", filters],
		placeholderData: keepPreviousData,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<unknown>>(apiRoutes.admin.AUDIT_LOG, {
				params: clean({
					action: filters.action.trim(),
					target_type: filters.targetType,
					limit: AUDIT_PAGE_SIZE,
					offset: (filters.page - 1) * AUDIT_PAGE_SIZE,
					order: "DESC",
				}),
			});
			return readPage<AuditEntry>(data, filters.page, AUDIT_PAGE_SIZE).items;
		},
	});
}
