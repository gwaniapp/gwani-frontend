import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@repo/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
});

const SITE_NAME = "gwani";
const SITE_DESCRIPTION = "gwani.";

export const metadata: Metadata = {
	metadataBase: SITE_URL,
	title: SITE_NAME,
	description: SITE_DESCRIPTION,
	manifest: "/favicon/site.webmanifest",
	icons: {
		icon: [{ url: "/favicon/favicon.svg", type: "image/svg+xml" }],
	},
	openGraph: {
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
		url: "/",
		siteName: SITE_NAME,
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_NAME,
		description: SITE_DESCRIPTION,
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
