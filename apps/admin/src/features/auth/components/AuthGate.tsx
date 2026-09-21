"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GwaniLoader } from "@repo/ui/gwani-loader";
import { Button } from "@repo/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { logAction } from "@/lib/logger";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Wraps the whole console: nothing renders until there's a signed-in **admin**. Signed out → sign-in.
 * Signed in as anyone else (a stale client/provider session) → that session is cleared and they go to
 * sign-in. If the profile can't be loaded (network, server) it says so and offers a retry rather than
 * bouncing. This is a client-side guard — every admin request is authorised server-side by the JWT's
 * role — so it stops strangers *seeing* the screens, it isn't what protects the data.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const current = useCurrentUser();

	useEffect(() => {
		if (current.status === "unauthenticated") {
			logAction("auth.guard", "info", { reason: "no session", redirect: "/auth/sign-in" });
			router.replace("/auth/sign-in");
		} else if (current.status === "authenticated" && current.user.role !== "ADMIN") {
			logAction("auth.guard", "info", { reason: `signed in as ${current.user.role}, not an admin`, redirect: "/auth/sign-in" });
			useAuthStore.getState().clear();
			router.replace("/auth/sign-in");
		}
	}, [current.status, current.user?.role, router]);

	if (current.status === "authenticated" && current.user.role === "ADMIN") return <>{children}</>;

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
			<p className="text-b3 text-muted-foreground">Loading…</p>
		</div>
	);
}

export { AuthGate };
