import type { Metadata } from "next";
import { FindProvidersView } from "@/features/dashboard/components/client/providers/FindProvidersView";

export const metadata: Metadata = { title: "Find Providers" };

export default function FindProvidersPage() {
	return <FindProvidersView />;
}
