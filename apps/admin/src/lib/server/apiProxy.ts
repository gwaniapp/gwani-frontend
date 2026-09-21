// Server-only — must never be imported from a "use client" file or anything
// else that ends up in the browser bundle.

export const API_BASE_URL = process.env.GWANI_API_BASE_URL ?? "https://gwani-backend-production.up.railway.app";

// The backend's OpenAPI spec declares only a `bearer` security scheme (no
// API-key header, unlike peakline's `peakline-ref`) — nothing to attach
// beyond the user's own JWT, which the proxy already forwards as-is. Kept as
// a hook (mirroring peakline's `buildProxyHeaders`) so adding one later, if
// the backend team introduces one, is a one-line change here rather than a
// re-plumb of the proxy route.
export function buildProxyHeaders(): Record<string, string> {
	return {};
}
