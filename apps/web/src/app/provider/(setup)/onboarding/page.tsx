import type { Metadata } from "next";
import { ProviderRegistrationForm } from "@/features/provider/components/ProviderRegistrationForm";

export const metadata: Metadata = { title: "Provider registration" };

export default function ProviderOnboardingPage() {
	return <ProviderRegistrationForm />;
}
