import { AuthGate } from "@/features/auth/components/AuthGate";
import { AdminShell } from "@/features/shell/components/AdminShell";

/** Every console page: guarded (admins only) and inside the frame. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGate>
			<AdminShell>{children}</AdminShell>
		</AuthGate>
	);
}
