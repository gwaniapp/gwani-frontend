import type { Metadata } from "next";
import { PostJobForm } from "@/features/dashboard/components/client/jobs/PostJobForm";

export const metadata: Metadata = { title: "Post a New Job" };

type Props = { searchParams: Promise<{ provider?: string }> };

export default async function PostJobPage({ searchParams }: Props) {
	// "Hire Provider" links here with ?provider=<id>; the form looks that provider up (and ignores an unknown id).
	const { provider } = await searchParams;
	return <PostJobForm defaultProviderId={provider ?? ""} />;
}
