"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GwaniLoader } from "@repo/ui/gwani-loader";
import { useCurrentUser } from "@/features/auth/hooks/useSession";

function RootRedirect() {
	const router = useRouter();
	const current = useCurrentUser();

	useEffect(() => {
		if (current.status === "authenticated") router.replace(current.user.role === "ADMIN" ? "/dashboard" : "/auth/sign-in");
		else if (current.status === "unauthenticated") router.replace("/auth/sign-in");
	}, [current.status, current.user?.role, router]);

	return (
		<div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-primary-100/10">
			<GwaniLoader />
		</div>
	);
}

export { RootRedirect };
