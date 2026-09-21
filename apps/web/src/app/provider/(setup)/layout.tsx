import { OnboardingLayout } from "@/components/layouts/OnboardingLayout";
import { AuthGate } from "@/features/auth/components/AuthGate";

export default function ProviderOnboardingRouteLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGate role="provider">
			<OnboardingLayout>{children}</OnboardingLayout>
		</AuthGate>
	);
}
