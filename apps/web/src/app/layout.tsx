import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@repo/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
});

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	// Pages set just their own name (e.g. "Sign up") and get " | Gwani"
	// appended; the root page falls back to `default`.
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
	interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html data-scroll-behavior="smooth" lang="en" className={`${manrope.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col">
				<ReactQueryProvider>
					<AuthProvider>
						{children}
						<Toaster />
					</AuthProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
