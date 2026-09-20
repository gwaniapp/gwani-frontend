import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
	return <DashboardShell role="client">{children}</DashboardShell>;
}
