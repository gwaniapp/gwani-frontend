/**
 * Response/request shapes for the real gwani backend
 * (https://gwani-backend-production.up.railway.app/docs-json, NestJS/Swagger,
 * confirmed live against the OpenAPI spec). Snake_case throughout — this is
 * the backend's own convention, not translated to camelCase, so a field name
 * here always matches the wire shape exactly.
 */

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN";

/** `ADMIN` accounts can't be self-registered (per the backend's own docs). */
export type SignUpRole = Exclude<UserRole, "ADMIN">;

/**
 * Every successful response is wrapped in this envelope by a global
 * interceptor — confirmed live against `/skills`, `/health/live`, and
 * `/providers/discover` (`{"data": ..., "meta": {"timestamp", "request_id"}}`
 * on all three), even though the OpenAPI spec's prose descriptions say
 * "returns X" as if unwrapped — the docs are wrong here, live behavior
 * isn't. Every `axios...get/post<T>()` call in this codebase should type its
 * response as `ApiSuccessResponse<T>` and unwrap `.data.data`, the same way
 * `useSession` does. Not yet directly confirmed for the auth endpoints
 * specifically (signup/login/verify-otp — untestable without a real inbox
 * for the OTP step) but assume the same wrapper applies; the first real
 * login call will confirm or correct this immediately.
 */
export interface ApiSuccessResponse<T> {
	data: T;
	meta: {
		timestamp: string;
		request_id: string;
	};
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

/** `GET /users/me`. */
export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: UserRole;
	email_verified: boolean;
	suspended: boolean;
	/** The user's own location (a client's, or a provider's account-level one); every part is null until set. */
	location?: UserLocation;
	created_at: string;
}

export interface UserLocation {
	country: string | null;
	state: string | null;
	city: string | null;
	area: string | null;
}

/** A NestJS global exception filter body — confirmed live. `meta.issues` is
 * only present for `VALIDATION_ERROR` responses. */
export interface ApiErrorResponse {
	statusCode: number;
	message: string;
	error: string;
	meta: {
		timestamp: string;
		path: string;
		method: string;
		request_id: string;
		issues?: unknown[];
	};
}

export type JobStatus =
	| "POSTED"
	| "PROVIDER_SELECTED"
	| "FUNDED"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "PAID"
	| "DISPUTED"
	| "CANCELLED";

/**
 * A job. `GET /jobs` and `POST /jobs` return the flat record (with `client_id` /
 * `provider_id`); `GET /jobs/{id}` returns a richer one instead — no ids, but the
 * `client`, the assigned provider's `location` and a status `timeline` (confirmed
 * live) — so the two sets of fields are optional here.
 */
export interface Job {
	id: string;
	title: string;
	description: string;
	price_amount: string;
	price_asset: string;
	status: JobStatus;
	client_id?: string;
	provider_id?: string | null;
	skill_category?: string | null;
	/** ISO datetime the client wants the work done by. */
	due_date?: string | null;
	created_at: string;
	updated_at?: string;
	/** `GET /jobs/{id}` only: the job's client, with their own location. */
	client?: { id: string; first_name: string; last_name: string; location?: UserLocation };
	/** The dashboard job lists (client side) only: the assigned provider (their `location` is on the job, below). */
	provider?: { id: string; first_name: string; last_name: string };
	/** `GET /jobs/{id}` only: the *assigned provider's* own profile location (null until one is selected) — not the client's, not a place for the job. */
	location?: UserLocation | null;
	/** `GET /jobs/{id}` only: one entry per lifecycle step; `date` is null until reached. Observed to leave the *current* step `completed: false`, so use only its dates. */
	timeline?: Array<{ status: JobStatus; completed: boolean; date: string | null }>;
}

/** `GET /jobs` — cursor-paginated. Field name inside the envelope's `data`
 * is inferred from the one confirmed live shape (`providers/discover`,
 * below uses `items`) — the OpenAPI prose says `data`/`next_cursor` instead;
 * not yet directly confirmed for this specific endpoint (needs auth to
 * test). Verify against the network tab on first real use. */
export interface PaginatedCursor<T> {
	items: T[];
	next_cursor: string | null;
}

/** `GET /providers/discover`, `GET /admin/users`, `GET /admin/jobs` —
 * offset-paginated. Confirmed live for `providers/discover`: the field is
 * `items`, not `data` as the OpenAPI prose describes. */
export interface PaginatedOffset<T> {
	items: T[];
	total: number;
	page: number;
	page_size: number;
}

/** `GET /jobs/{id}/events`. */
export interface JobEvent {
	id: string;
	type: string;
	data: Record<string, unknown>;
	created_at: string;
}

/** `GET /jobs/{id}/transitions`. */
export interface JobStateTransition {
	from: JobStatus | null;
	to: JobStatus;
	actor: string | null;
	note: string | null;
	created_at: string;
}

/**
 * One record of a job's escrow lifecycle, `GET /jobs/{id}/escrow` (client, assigned
 * provider or admin). Funding is asynchronous — `POST .../escrow/fund` only *submits* the
 * transaction — so these say where it stands. Confirmed live: `intent` (the spec says
 * `operation`) is FUND / RELEASE / REFUND, `status` was "FAILED" with a JSON `error` string;
 * other statuses are unobserved (treated as "pending" until `confirmed_at` is set).
 */
export interface EscrowRecord {
	id: string;
	job_id: string;
	intent?: string;
	operation?: string;
	tx_hash: string | null;
	status: string;
	error?: string | null;
	submitted_at: string;
	confirmed_at: string | null;
}

export type WalletType = "custodial" | "linked";

/** `POST /wallet/transfer` — a custodial wallet is signed and sent at once (`{ tx_hash }`); a linked one can't be, so an unsigned transaction comes back. */
export type TransferResult = { tx_hash: string } | { type: "unsigned_xdr"; xdr: string; message?: string };

/** `GET /wallet/me`. */
export interface Wallet {
	public_key: string;
	type: WalletType;
	funded: boolean;
	trustline_created: boolean;
	/** The wallet's on-chain USDC balance, a decimal string ("10000.0000000"). Added to `GET /wallet/me` after the spec was written. */
	usdc_balance?: string;
	/** Locked in escrow for this *provider's* in-flight jobs (funded, not yet released) — not part of `usdc_balance`. Always "0" for a client. */
	funds_in_escrow?: string;
}

/** `GET /wallet/transactions` — escrow events that moved money into or out of the user's own wallet. */
export interface WalletTransaction {
	id: string;
	job_id: string;
	job_title: string;
	/** Client: FUND (out) / REFUND (in). Provider: RELEASE (in). */
	type: "FUND" | "REFUND" | "RELEASE";
	direction: "in" | "out";
	amount: string;
	asset: string;
	/** Observed: "FAILED" for a transaction that was in fact confirmed on-chain (backend bug). Others unobserved. */
	status: string;
	tx_hash: string | null;
	submitted_at: string;
	confirmed_at: string | null;
}

/** `GET /providers/provider/dashboard/stats`. */
export interface ProviderDashboardStats {
	active_jobs: number;
	completed_jobs: number;
	/** Jobs marked COMPLETED and awaiting the client's release — a count, not an amount. */
	pending_payments: number;
	reputation_score: string;
}

/** `GET /jobs/client/dashboard/stats`. */
export interface ClientDashboardStats {
	active_jobs: number;
	completed_jobs: number;
	/** Sum of the client's PAID jobs, a decimal string. */
	total_spent: string;
}

export interface BootstrapWalletData {
	funded: boolean;
	trustline_created: boolean;
}

export interface WalletLinkChallengeData {
	challenge: string;
}

/** `GET /skills` — public, cached. */
export interface Skill {
	id: string;
	slug: string;
	name: string;
}

/** One of a provider's recent finished jobs, as `GET /providers/{id}` lists them (`job_history`, up to 10; `date` = when it reached COMPLETED). No price or client. */
export interface ProviderJob {
	id: string;
	title: string;
	status: JobStatus;
	date: string;
}

/**
 * A provider as the app uses it — *normalized* (see `normalizeProvider`) from the
 * backend's real shapes (all confirmed live): the full profile (`GET /providers/{id}`
 * and `/providers/me/profile`, now flat: `{ id, first_name, last_name,
 * profile_picture_url, bio, wallet_address, wallet_type, skills, skill_category,
 * reputation_score, completed_jobs, location: {…}, job_history }`; it used to nest a
 * `user` row that leaked the password hash), the client-only search row
 * (`GET /providers/search`: names, picture, category, reputation, location — no skills)
 * and the public directory row (`GET /providers/discover`: `{ user_id, bio, location_*,
 * reputation_score, completed_jobs_count }` — no name, picture or skills).
 */
export interface ProviderProfile {
	/** The provider's *user* id — what `select-provider` and `GET /providers/{id}` take. */
	id: string;
	user_id: string;
	/** Empty when the source (the directory list) doesn't carry names. */
	first_name: string;
	last_name: string;
	bio: string;
	location_country: string;
	location_state: string;
	location_city: string;
	location_area: string;
	/** Empty when the source doesn't carry skills (the directory and search lists) — fetch the full profile for them. */
	skills: Skill[];
	skill_category: string;
	reputation: number;
	jobs_completed: number;
	wallet_address?: string;
	wallet_type?: WalletType;
	/** A 7-day presigned URL for their profile picture, when they've uploaded one. */
	avatar_url?: string;
	/** Up to 10 recent finished jobs (full profile only; empty otherwise). */
	job_history: ProviderJob[];
	/** True once this came from the full profile (skills and bio are then real, not just absent). */
	detailed: boolean;
}

/** `GET /files/{id}/download-url`. */
export interface FileDownloadUrlData {
	download_url: string;
	expires_at: string;
}
