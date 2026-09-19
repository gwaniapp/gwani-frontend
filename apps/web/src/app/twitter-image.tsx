import { renderOgImage } from "./og-image";

// Same image as opengraph-image.tsx, reused for Twitter/X cards. Next.js
// requires each special file to declare its own literal config exports
// (not re-exported), hence this near-duplicate rather than one shared file.
export const runtime = "nodejs";
export const alt = "Gwani — Hire verified professionals. Pay with confidence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
	return renderOgImage();
}
