import type { Metadata } from "next";
import { JobsView } from "@/features/dashboard/components/jobs/JobsView";

export const metadata: Metadata = { title: "My Jobs" };

export default function ProviderJobsPage() {
	return <JobsView />;
}
