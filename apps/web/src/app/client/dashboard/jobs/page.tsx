import type { Metadata } from "next";
import { ClientJobsView } from "@/features/dashboard/components/client/jobs/ClientJobsView";

export const metadata: Metadata = { title: "My Jobs" };

export default function ClientJobsPage() {
	return <ClientJobsView />;
}
