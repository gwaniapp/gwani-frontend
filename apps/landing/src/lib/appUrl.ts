/**
 * apps/landing is its own deployment (own domain/port), but auth and every
 * dashboard live in apps/web — every "Sign in" / "Get Started" CTA here has
 * to cross apps, not route internally. `NEXT_PUBLIC_APP_URL` should be set
 * on the landing deployment to point at apps/web's real origin; without it,
 * this falls back to apps/web's production domain outside local dev
 * (`NODE_ENV=production`), or apps/web's own local dev port when running
 * this app on its own machine.
 */
const LOCAL_APP_URL = "http://localhost:3000";
const PROD_APP_URL = "https://user.gwanni.app";

const APP_URL =
	process.env.NEXT_PUBLIC_APP_URL ?? (process.env.NODE_ENV === "production" ? PROD_APP_URL : LOCAL_APP_URL);

function appUrl(path: string): string {
	return `${APP_URL}${path}`;
}

export { appUrl };
