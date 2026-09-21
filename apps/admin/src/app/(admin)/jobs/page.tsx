import type { Metadata } from "next";
import { JobsView } from "@/features/admin/components/JobsView";

export const metadata: Metadata = { title: "Jobs" };

export default function Page() {
	return <JobsView />;
}
