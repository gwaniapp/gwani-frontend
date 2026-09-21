import type { Metadata } from "next";
import { FindProvidersView } from "@/features/dashboard/components/client/providers/FindProvidersView";

export const metadata: Metadata = { title: "Find Providers" };

/** `?q=` pre-fills the search (the header search box hands its text over this way). */
export default async function FindProvidersPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
	const { q } = await searchParams;
	const initialQuery = (Array.isArray(q) ? q[0] : q) ?? "";
	// Keyed so a new `?q=` while already on this page starts a fresh search.
	return <FindProvidersView key={initialQuery} initialQuery={initialQuery} />;
}
