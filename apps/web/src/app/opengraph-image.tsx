import { renderOgImage } from "./og-image";

export const runtime = "nodejs";
export const alt = "Gwani — Hire verified professionals. Pay with confidence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return renderOgImage();
}
