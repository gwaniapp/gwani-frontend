import { AuthGate } from "@/features/auth/components/AuthGate";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGate role="client">
			<DashboardShell role="client">{children}</DashboardShell>
		</AuthGate>
	);
}
