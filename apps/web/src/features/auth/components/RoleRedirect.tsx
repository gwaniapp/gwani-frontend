"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GwaniLoader } from "@repo/ui/gwani-loader";
import { dashboardHomeFor } from "@/features/dashboard/config";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { logAction } from "@/lib/logger";

/**
 * The app's front door (`/`): signed in → the dashboard for your role,
 * otherwise → sign in. There's no page here on purpose — the public site lives
 * in `apps/landing`. The role comes from the signed-in user (`GET /users/me`).
 */
function RoleRedirect() {
	const router = useRouter();
	const current = useCurrentUser();

	useEffect(() => {
		if (current.status === "loading" || current.status === "error") return;
		const target = (current.status === "authenticated" && dashboardHomeFor(current.user.role)) || "/auth/sign-in";
		logAction("navigation.front-door", "info", { status: current.status, redirect: target });
		router.replace(target);
	}, [current.status, current.user?.role, router]);

	return (
		<div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 bg-primary-100/10">
			<GwaniLoader />
			<p className="text-b3 text-muted-foreground">
				{current.status === "error" ? "We couldn't reach the server. Refresh to try again." : "Taking you to your dashboard…"}
			</p>
		</div>
	);
}

export { RoleRedirect };
