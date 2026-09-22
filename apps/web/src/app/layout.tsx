import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@repo/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { InstallPromptListener } from "@/components/providers/InstallPromptListener";
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
			{/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject their own
			    attributes onto <body> — data-new-gr-c-s-check-loaded, data-gr-ext-installed —
			    before React hydrates. That's a real mismatch React would otherwise warn about,
			    but it's the extension's doing, not this app's, and only <body>'s own attributes
			    are suppressed here — a genuine mismatch in its children still warns normally. */}
			<body className="min-h-full flex flex-col" suppressHydrationWarning>
				{/* Chrome fires `beforeinstallprompt` once and may do it before React has hydrated, so it's caught here, as early as possible,
				    and picked up by `InstallPromptListener` (which powers Settings → Download Gwani). */}
				<Script id="capture-install-prompt" strategy="beforeInteractive">
					{`window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__gwaniInstallPrompt=e;});`}
				</Script>
				<ReactQueryProvider>
					<AuthProvider>
						{children}
						<Toaster />
						<InstallPromptListener />
					</AuthProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
