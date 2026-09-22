/**
 * apps/landing is its own deployment (own domain/port), but auth and every
 * dashboard live in apps/web — every "Sign in" / "Get Started" CTA here has
 * to cross apps, not route internally. `NEXT_PUBLIC_APP_URL` should be set
 * on the landing deployment to point at apps/web's real origin; without it,
 * this falls back to apps/web's own local dev port so nothing extra is
 * needed to run this app on its own machine. Set the production fallback
 * once apps/web has a real deployed domain (see peakline's apps/landing/src/
 * lib/appUrl.ts for the pattern this follows).
 */
const LOCAL_APP_URL = "http://localhost:3000";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? LOCAL_APP_URL;

function appUrl(path: string): string {
	return `${APP_URL}${path}`;
}

export { appUrl };
