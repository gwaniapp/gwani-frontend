import type { Metadata } from "next";
import { PostJobForm } from "@/features/dashboard/components/client/jobs/PostJobForm";
import { MOCK_PROVIDERS } from "@/lib/mock/providers";

export const metadata: Metadata = { title: "Post a New Job" };

type Props = { searchParams: Promise<{ provider?: string }> };

export default async function PostJobPage({ searchParams }: Props) {
	const { provider } = await searchParams;
	// "Hire Provider" links here with ?provider=<id>; ignore anything that isn't a known provider.
	const defaultProviderId = MOCK_PROVIDERS.some((item) => item.id === provider) ? (provider as string) : "";
	return <PostJobForm defaultProviderId={defaultProviderId} />;
}
