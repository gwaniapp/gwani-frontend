import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@repo/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	// Pages set just their own name (e.g. "Users") and get " | Gwani Admin" appended.
	title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	manifest: "/favicon/site.webmanifest",
	// An internal tool: keep it out of search results.
	robots: { index: false, follow: false },
	icons: {
		icon: [
			{ url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/favicon/apple-touch-icon.png",
	},
};

export const viewport: Viewport = {
	themeColor: "#3231C6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
