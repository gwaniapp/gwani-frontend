import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Node's native `fetch` doesn't support `file://` URLs (only the edge
 * runtime's polyfilled one does), so local assets are read straight off
 * disk instead of via `fetch(new URL(..., import.meta.url))`. */
function loadLocalFile(relativePath: string) {
	return readFile(fileURLToPath(new URL(relativePath, import.meta.url)));
}

// Brand colors, from packages/ui/src/styles/globals.css's primary ramp —
// duplicated here since ImageResponse (Satori) can't read our Tailwind
// tokens, only literal values. Kept identical to apps/web/src/app/og-image.tsx.
const PRIMARY_900 = "#13124a";
const PRIMARY_700 = "#262595";
const PRIMARY_500 = "#3f3df8";
const PRIMARY_200 = "#b2b1fc";

/**
 * Shared by opengraph-image.tsx and twitter-image.tsx — Next.js requires
 * each special file's `runtime`/`size`/`contentType`/`alt` exports to be
 * literal and declared directly in that file (not re-exported), so only the
 * actual rendering logic is factored out here.
 */
async function renderOgImage() {
	const [regularFont, boldFont, iconBuffer] = await Promise.all([
		loadLocalFile("./og-fonts/Manrope-Regular.woff"),
		loadLocalFile("./og-fonts/Manrope-Bold.woff"),
		loadLocalFile("../../public/favicon/android-chrome-192x192.png"),
	]);
	const iconSrc = `data:image/png;base64,${iconBuffer.toString("base64")}`;

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "80px",
					position: "relative",
					fontFamily: "Manrope",
					background: `linear-gradient(135deg, ${PRIMARY_900} 0%, ${PRIMARY_700} 60%, ${PRIMARY_500} 100%)`,
				}}
			>
				<div
					style={{
						display: "flex",
						position: "absolute",
						top: -120,
						right: -120,
						width: 420,
						height: 420,
						borderRadius: 420,
						background: "rgba(255,255,255,0.06)",
					}}
				/>
				<div
					style={{
						display: "flex",
						position: "absolute",
						bottom: -150,
						right: 200,
						width: 260,
						height: 260,
						borderRadius: 260,
						background: "rgba(178,177,252,0.14)",
					}}
				/>

				<div style={{ display: "flex", alignItems: "center", gap: 22 }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 96,
							height: 96,
							borderRadius: 22,
							background: "#ffffff",
						}}
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={iconSrc} width={72} height={72} alt="" />
					</div>
					<span style={{ fontSize: 58, fontWeight: 700, color: "#ffffff" }}>{SITE_NAME}</span>
				</div>

				<div
					style={{
						display: "flex",
						marginTop: 40,
						fontSize: 40,
						fontWeight: 700,
						color: PRIMARY_200,
					}}
				>
					{SITE_TAGLINE}
				</div>

				<div
					style={{
						display: "flex",
						marginTop: 18,
						maxWidth: 820,
						fontSize: 27,
						fontWeight: 400,
						lineHeight: 1.4,
						color: "rgba(255,255,255,0.85)",
					}}
				>
					{SITE_DESCRIPTION}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{ name: "Manrope", data: regularFont, weight: 400, style: "normal" },
				{ name: "Manrope", data: boldFont, weight: 700, style: "normal" },
			],
		},
	);
}

export { renderOgImage };
