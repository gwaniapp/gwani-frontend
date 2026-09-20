import type { Metadata } from "next";
import { ClientOverview } from "@/features/dashboard/components/client/ClientOverview";

export const metadata: Metadata = { title: "Dashboard" };

export default function ClientDashboardPage() {
	return <ClientOverview />;
}
