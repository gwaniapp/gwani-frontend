/**
 * Absolute site URL, for `metadataBase` and anywhere else a fully-qualified
 * URL is needed (social meta tags, canonical links). Prefers an explicit
 * custom domain once one exists; falls back to Vercel's stable production
 * domain, then the current deployment's own URL, then localhost for local
 * dev. Vercel injects `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL`
 * automatically — neither needs setting by hand.
 */
const SITE_URL = new URL(
	process.env.NEXT_PUBLIC_SITE_URL ??
		(process.env.VERCEL_PROJECT_PRODUCTION_URL &&
			`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ??
		(process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ??
		"http://localhost:3000",
);

export { SITE_URL };
