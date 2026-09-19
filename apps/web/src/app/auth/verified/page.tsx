import type { Metadata } from "next";
import { EmailVerified } from "@/features/auth/components/EmailVerified";

export const metadata: Metadata = { title: "Email verified" };

export default async function VerifiedPage({ searchParams }: PageProps<"/auth/verified">) {
	const { role } = await searchParams;

	// Anything but an explicit `client` shows the provider version — the one
	// that's been designed, and what a direct visit should preview.
	return <EmailVerified role={role === "client" ? "CLIENT" : "PROVIDER"} />;
}
