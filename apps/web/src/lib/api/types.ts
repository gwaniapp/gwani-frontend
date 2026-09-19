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
	verified: boolean;
	suspended: boolean;
	created_at: string;
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

/** `POST /jobs`, `GET /jobs/{id}`. */
export interface Job {
	id: string;
	title: string;
	description: string;
	price_amount: string;
	price_asset: string;
	status: JobStatus;
	client_id: string;
	provider_id: string | null;
	created_at: string;
	updated_at?: string;
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

/** `GET /jobs/{id}/escrow`. */
export interface EscrowTransaction {
	tx_hash: string;
	operation: "fund" | "release" | "refund";
	amount: string;
	asset: string;
	confirmed_at: string;
}

export type WalletType = "custodial" | "linked";

/** `GET /wallet/me`. */
export interface Wallet {
	public_key: string;
	type: WalletType;
	funded: boolean;
	trustline_created: boolean;
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

/** `GET /providers/{id}`, `GET /providers/me/profile`. */
export interface ProviderProfile {
	id: string;
	bio: string | null;
	location_country: string | null;
	location_city: string | null;
	location_geohash: string | null;
	skills: Skill[];
	reputation: number;
	jobs_completed: number;
}

export type FileUploadPurpose = "AVATAR" | "JOB_ATTACHMENT";

/** `POST /files/request-upload`. */
export interface FileUploadUrlData {
	file_id: string;
	upload_url: string;
	expires_at: string;
}

/** `GET /files/{id}/download-url`. */
export interface FileDownloadUrlData {
	download_url: string;
	expires_at: string;
}
