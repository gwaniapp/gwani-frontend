import type { Metadata } from "next";
import { SettingsView } from "@/features/settings/components/SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function ProviderSettingsPage() {
	return <SettingsView role="provider" />;
}
