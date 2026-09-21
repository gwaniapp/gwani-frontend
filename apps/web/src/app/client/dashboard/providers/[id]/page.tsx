import type { Metadata } from "next";
import { ProviderPreviewView } from "@/features/dashboard/components/client/providers/ProviderPreviewView";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Provider" };

export default async function ProviderPreviewPage({ params }: Props) {
	const { id } = await params;
	return <ProviderPreviewView id={id} />;
}
