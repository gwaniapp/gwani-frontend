/**
 * Shapes for the Gwani backend's admin surface (https://gwani-backend-production.up.railway.app/docs-json).
 * Snake_case, exactly as on the wire. Every success response is wrapped in `{ data, meta }` by a global
 * interceptor, so typed calls unwrap `.data.data`. The spec's prose has been wrong about list shapes before,
 * so lists are read defensively (see `readPage` in `lib/api/pagination.ts`).
 */

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN";

export interface ApiSuccessResponse<T> {
	data: T;
	meta: { timestamp: string; request_id: string };
}

export interface ApiErrorResponse {
	statusCode: number;
	message: string;
	error: string;
	meta: { timestamp: string; path: string; method: string; request_id: string; issues?: unknown[] };
}

export interface AuthTokensData {
	access_token: string;
	refresh_token: string;
	user: User;
}

export interface RefreshTokensData {
	access_token: string;
	refresh_token: string;
}

/** `GET /users/me` and the `user` in a login response. */
export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: UserRole;
	email_verified?: boolean;
	suspended: boolean;
	created_at: string;
}

/** A row of `GET /admin/users`. Optional fields aren't guaranteed by the spec. */
export interface AdminUser extends User {
	deleted_at?: string | null;
	location?: { country: string | null; state: string | null; city: string | null; area: string | null };
}

export const JOB_STATUSES = ["POSTED", "PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS", "COMPLETED", "PAID", "DISPUTED", "CANCELLED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/** A row of `GET /admin/jobs` (every job on the platform). */
export interface AdminJob {
	id: string;
	title: string;
	description?: string;
	status: JobStatus;
	price_amount: string;
	price_asset: string;
	client_id?: string;
	provider_id?: string | null;
	skill_category?: string | null;
	due_date?: string | null;
	created_at: string;
	updated_at?: string;
}

/** `GET /jobs/{id}/transitions` — the status history, including an admin's note or a dispute's reason. */
export interface JobTransition {
	from: JobStatus | null;
	to: JobStatus;
	actor: string | null;
	note: string | null;
	created_at: string;
}

/** `GET /jobs/{id}/escrow` — on-chain payment records (funding, release, refund). */
export interface EscrowRecord {
	id: string;
	intent?: string;
	operation?: string;
	tx_hash: string | null;
	status: string;
	error?: string | null;
	submitted_at: string;
	confirmed_at: string | null;
}

/** `GET /admin/stats`. `volume` is grouped by asset; its exact shape (object or list) is read defensively. */
export interface AdminStats {
	users: { total: number; suspended: number; by_role?: Record<string, number> };
	jobs: { total: number; disputed: number; by_status?: Record<string, number> };
	volume: { paid?: unknown; locked_in_escrow?: unknown };
}

/** A row of `GET /admin/audit-log`. Every admin action (suspend, erase, export, force_transition, …) is recorded. */
export interface AuditEntry {
	id: string;
	actor_user_id?: string | null;
	action: string;
	target_type?: string | null;
	target_id?: string | null;
	metadata?: Record<string, unknown> | null;
	created_at: string;
}

export interface Page<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}
