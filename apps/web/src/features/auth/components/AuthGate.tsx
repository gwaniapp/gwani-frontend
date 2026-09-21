"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GwaniLoader } from "@repo/ui/gwani-loader";
import { Button } from "@repo/ui/button";
import { dashboardHomeFor, type DashboardRole } from "@/features/dashboard/config";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { logAction } from "@/lib/logger";
import type { UserRole } from "@/lib/api/types";

const ROLE_FOR: Record<DashboardRole, UserRole> = { provider: "PROVIDER", client: "CLIENT" };

/**
 * Wraps a whole dashboard: nothing renders until there's a signed-in user of
 * the right role. Signed out → sign-in. Signed in as the *other* role → their
 * own dashboard (a provider opening `/client/...` lands on `/provider/...`). If
 * the profile can't be loaded (network, server), it says so and offers a retry
 * instead of bouncing to sign-in — the session itself may be fine.
 *
 * This is a client-side guard (tokens live in cookies this app reads itself),
 * so it keeps a stranger from *seeing* the screens but it isn't what protects
 * the data: every backend call is authorised server-side with the JWT.
 */
function AuthGate({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
	const router = useRouter();
	const current = useCurrentUser();
	const expected = ROLE_FOR[role];

	useEffect(() => {
		if (current.status === "unauthenticated") {
			logAction("auth.guard", "info", { reason: "no session", redirect: "/auth/sign-in" });
			router.replace("/auth/sign-in");
		} else if (current.status === "authenticated" && current.user.role !== expected) {
			const home = dashboardHomeFor(current.user.role) ?? "/auth/sign-in";
			logAction("auth.guard", "info", { reason: `signed in as ${current.user.role}, this area is for ${expected}`, redirect: home });
			router.replace(home);
		}
	}, [current.status, current.user?.role, expected, router]);

	if (current.status === "authenticated" && current.user.role === expected) return <>{children}</>;

	if (current.status === "error") {
		return (
			<div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-primary-100/10 px-6 text-center">
				<h1 className="text-xl font-medium text-foreground">We couldn&apos;t load your account</h1>
				<p className="max-w-sm text-b3 text-neutral-500">Check your connection and try again.</p>
				<Button type="button" onClick={current.retry}>
					Try again
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 bg-primary-100/10">
			<GwaniLoader />
			<p className="text-b3 text-muted-foreground">Loading your account…</p>
		</div>
	);
}

export { AuthGate };
