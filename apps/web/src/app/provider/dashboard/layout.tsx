import { AuthGate } from "@/features/auth/components/AuthGate";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGate role="provider">
			<DashboardShell role="provider">{children}</DashboardShell>
		</AuthGate>
	);
}
