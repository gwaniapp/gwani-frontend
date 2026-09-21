/**
 * Backend paths the admin app uses, forwarded verbatim by the same-origin proxy
 * (`src/app/api/proxy/[...path]/route.ts`). They already include the `/api/v1` prefix.
 */
export const apiRoutes = {
	auth: {
		LOGIN: "/api/v1/auth/login",
		REFRESH: "/api/v1/auth/refresh",
		LOGOUT: "/api/v1/auth/logout",
	},
	users: {
		ME: "/api/v1/users/me",
	},
	admin: {
		STATS: "/api/v1/admin/stats",
		USERS: "/api/v1/admin/users",
		byUserIdSuspend: (id: string) => `/api/v1/admin/users/${id}/suspend`,
		byUserIdUnsuspend: (id: string) => `/api/v1/admin/users/${id}/unsuspend`,
		byUserIdPromote: (id: string) => `/api/v1/admin/users/${id}/promote`,
		byUserIdDemote: (id: string) => `/api/v1/admin/users/${id}/demote`,
		byUserIdExport: (id: string) => `/api/v1/admin/users/${id}/export`,
		byUserId: (id: string) => `/api/v1/admin/users/${id}`,
		JOBS: "/api/v1/admin/jobs",
		DISPUTES: "/api/v1/admin/disputes",
		byJobIdForceTransition: (id: string) => `/api/v1/admin/jobs/${id}/force-transition`,
		AUDIT_LOG: "/api/v1/admin/audit-log",
	},
	jobs: {
		byIdTransitions: (id: string) => `/api/v1/jobs/${id}/transitions`,
		byIdEscrow: (id: string) => `/api/v1/jobs/${id}/escrow`,
	},
} as const;
