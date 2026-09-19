import type { Metadata } from "next";
import { ProfileView } from "@/features/dashboard/components/profile/ProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function ProviderProfilePage() {
	return <ProfileView />;
}
