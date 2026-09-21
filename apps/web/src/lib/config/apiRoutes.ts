/**
 * Real backend paths, forwarded verbatim by the same-origin proxy
 * (`src/app/api/proxy/[...path]/route.ts`) — confirmed live against
 * https://gwani-backend-production.up.railway.app/docs-json. Already include
 * the `/api/v1` prefix the actual API expects.
 */
export const apiRoutes = {
	health: {
		LIVE: "/api/v1/health/live",
		READY: "/api/v1/health/ready",
	},

	auth: {
		SIGNUP: "/api/v1/auth/signup",
		VERIFY_OTP: "/api/v1/auth/verify-otp",
		RESEND_OTP: "/api/v1/auth/resend-otp",
		LOGIN: "/api/v1/auth/login",
		REFRESH: "/api/v1/auth/refresh",
		LOGOUT: "/api/v1/auth/logout",
		FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
		RESET_PASSWORD: "/api/v1/auth/reset-password",
	},

	users: {
		ME: "/api/v1/users/me",
		PROFILE_PICTURE: "/api/v1/users/me/profile-picture",
	},

	wallet: {
		ME: "/api/v1/wallet/me",
		BOOTSTRAP: "/api/v1/wallet/me/bootstrap",
		GENERATE: "/api/v1/wallet/generate",
		TRANSACTIONS: "/api/v1/wallet/transactions",
		TRANSFER: "/api/v1/wallet/transfer",
		LINK_CHALLENGE: "/api/v1/wallet/link/challenge",
		LINK_VERIFY: "/api/v1/wallet/link/verify",
		LINK: "/api/v1/wallet/link",
	},

	skills: "/api/v1/skills",

	providers: {
		DISCOVER: "/api/v1/providers/discover",
		SEARCH: "/api/v1/providers/search",
		byId: (id: string) => `/api/v1/providers/${id}`,
		ME_PROFILE: "/api/v1/providers/me/profile",
		DASHBOARD_STATS: "/api/v1/providers/provider/dashboard/stats",
		DASHBOARD_JOBS: "/api/v1/providers/provider/dashboard/jobs",
		WORK_HISTORY: "/api/v1/providers/me/work-history",
	},

	jobs: {
		BASE: "/api/v1/jobs",
		CLIENT_DASHBOARD_STATS: "/api/v1/jobs/client/dashboard/stats",
		CLIENT_DASHBOARD_JOBS: "/api/v1/jobs/client/dashboard/jobs",
		byId: (id: string) => `/api/v1/jobs/${id}`,
		byIdEvents: (id: string) => `/api/v1/jobs/${id}/events`,
		byIdTransitions: (id: string) => `/api/v1/jobs/${id}/transitions`,
		byIdSelectProvider: (id: string) => `/api/v1/jobs/${id}/select-provider`,
		byIdMarkCompleted: (id: string) => `/api/v1/jobs/${id}/mark-completed`,
		byIdDispute: (id: string) => `/api/v1/jobs/${id}/dispute`,
		byIdSse: (id: string) => `/api/v1/sse/jobs/${id}`,
	},

	escrow: {
		byJobIdFund: (jobId: string) => `/api/v1/jobs/${jobId}/escrow/fund`,
		byJobIdRelease: (jobId: string) => `/api/v1/jobs/${jobId}/escrow/release`,
		byJobIdRefund: (jobId: string) => `/api/v1/jobs/${jobId}/escrow/refund`,
		byJobId: (jobId: string) => `/api/v1/jobs/${jobId}/escrow`,
	},

	files: {
		byIdDownloadUrl: (id: string) => `/api/v1/files/${id}/download-url`,
	},

	// Admin surface exists on the backend but no admin app is planned yet —
	// kept here so it's a one-line addition (like everything else) when one
	// gets built, not a re-discovery.
	admin: {
		USERS: "/api/v1/admin/users",
		byUserIdSuspend: (id: string) => `/api/v1/admin/users/${id}/suspend`,
		byUserIdUnsuspend: (id: string) => `/api/v1/admin/users/${id}/unsuspend`,
		byUserId: (id: string) => `/api/v1/admin/users/${id}`,
		byUserIdExport: (id: string) => `/api/v1/admin/users/${id}/export`,
		AUDIT_LOG: "/api/v1/admin/audit-log",
		JOBS: "/api/v1/admin/jobs",
		DISPUTES: "/api/v1/admin/disputes",
		byJobIdForceTransition: (id: string) => `/api/v1/admin/jobs/${id}/force-transition`,
	},
};
