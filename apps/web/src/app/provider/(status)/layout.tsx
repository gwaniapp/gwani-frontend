import { AuthGate } from "@/features/auth/components/AuthGate";

export default function ProviderStatusRouteLayout({ children }: { children: React.ReactNode }) {
	return <AuthGate role="provider">{children}</AuthGate>;
}
