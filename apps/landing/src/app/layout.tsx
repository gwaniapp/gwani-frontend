import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
});

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	manifest: "/favicon/site.webmanifest",
	// /favicon.ico is served automatically from src/app/favicon.ico.
	icons: {
		icon: [
			{ url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/favicon/apple-touch-icon.png",
	},
	openGraph: {
		title: DEFAULT_TITLE,
		description: SITE_DESCRIPTION,
		url: "/",
		siteName: SITE_NAME,
		locale: "en_US",
		type: "website",
		// opengraph-image.tsx (this directory) supplies the image itself —
		// Next.js wires it into these tags automatically.
	},
	twitter: {
		card: "summary_large_image",
		title: DEFAULT_TITLE,
		description: SITE_DESCRIPTION,
		// twitter-image.tsx supplies the image.
	},
};

export const viewport: Viewport = {
	themeColor: "#3231C6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			data-scroll-behavior="smooth"
			lang="en"
			className={`${manrope.variable} h-full overflow-x-hidden antialiased`}
		>
			{/* overflow-x-hidden here too, not just on <main> (LandingPage.tsx): the
			 * Navbar is `position: fixed` so it's positioned against the viewport
			 * directly, escaping <main>'s own overflow clipping entirely — only the
			 * root scrolling element can contain a fixed descendant that overflows
			 * horizontally. suppressHydrationWarning matches apps/web: browser
			 * extensions (Grammarly etc.) inject their own attributes onto <body>
			 * before React hydrates, which is a real but harmless mismatch. */}
			<body className="min-h-full flex flex-col overflow-x-hidden" suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
