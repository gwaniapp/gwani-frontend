"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GwaniLoader } from "@repo/ui/gwani-loader";
import { dashboardHomeFor } from "@/features/dashboard/config";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useMockSessionStore } from "@/lib/stores/mockSessionStore";

/**
 * The app's front door (`/`): signed in → the dashboard for your role,
 * otherwise → sign in. There's no page here on purpose — the public site lives
 * in `apps/landing`. Role comes from the mock session for now (see
 * `mockSessionStore`); with real auth it comes from the session's user.
 */
function RoleRedirect() {
	const router = useRouter();
	const hydrated = useStoreHydrated(useMockSessionStore.persist);
	const role = useMockSessionStore((state) => state.role);

	useEffect(() => {
		if (!hydrated) return;
		router.replace((role && dashboardHomeFor(role)) || "/auth/sign-in");
	}, [hydrated, role, router]);

	return (
		<div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 bg-primary-100/10">
			<GwaniLoader />
			<p className="text-b3 text-muted-foreground">Taking you to your dashboard…</p>
		</div>
	);
}

export { RoleRedirect };
