import type { Metadata } from "next";
import { DisputesView } from "@/features/admin/components/DisputesView";

export const metadata: Metadata = { title: "Disputes" };

export default function Page() {
	return <DisputesView />;
}
