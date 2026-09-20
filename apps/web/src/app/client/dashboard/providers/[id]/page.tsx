import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderPreviewView } from "@/features/dashboard/components/client/providers/ProviderPreviewView";
import { getProviderPreview } from "@/lib/mock/providerPreview";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const provider = getProviderPreview((await params).id);
	return { title: provider ? provider.name : "Provider not found" };
}

export default async function ProviderPreviewPage({ params }: Props) {
	const provider = getProviderPreview((await params).id);
	if (!provider) notFound();
	return <ProviderPreviewView provider={provider} />;
}
