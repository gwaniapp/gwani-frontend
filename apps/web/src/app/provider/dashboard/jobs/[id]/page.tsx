import type { Metadata } from "next";
import { JobDetailView } from "@/features/dashboard/components/jobs/JobDetailView";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Job" };

export default async function ProviderJobPage({ params }: Props) {
	const { id } = await params;
	return <JobDetailView id={id} role="provider" />;
}
