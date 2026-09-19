import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetailView } from "@/features/dashboard/components/jobs/JobDetailView";
import { getJobDetail } from "@/lib/mock/providerJobDetail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const job = getJobDetail((await params).id);
	return { title: job ? job.title : "Job not found" };
}

export default async function ProviderJobPage({ params }: Props) {
	const job = getJobDetail((await params).id);
	if (!job) notFound();
	return <JobDetailView job={job} />;
}
