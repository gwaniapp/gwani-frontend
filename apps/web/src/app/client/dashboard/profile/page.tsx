import type { Metadata } from "next";
import { ClientProfileView } from "@/features/dashboard/components/client/ClientProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function ClientProfilePage() {
	return <ClientProfileView />;
}
