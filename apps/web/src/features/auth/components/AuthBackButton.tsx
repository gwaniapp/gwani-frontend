"use client";

import { usePathname, useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

// Only the screens that sit *inside* a flow get a back button — the entry
// screens (role selection, the sign-up form) don't.
const ROUTES_WITH_BACK = ["/auth/verify-otp", "/auth/verified"];

function AuthBackButton({ className }: { className?: string }) {
	const pathname = usePathname();
	const router = useRouter();

	if (!ROUTES_WITH_BACK.includes(pathname)) return null;

	function goBack() {
		// Opened directly (new tab, refresh into it) — nothing to go back to.
		if (window.history.length <= 1) router.push("/auth/sign-up");
		else router.back();
	}

	return (
		<button
			type="button"
			onClick={goBack}
			aria-label="Go back"
			className={cn(
				"flex items-center justify-center rounded-full bg-muted text-foreground outline-none transition-colors hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary-300",
				className,
			)}
		>
			<Undo2 className="size-5 md:size-6" aria-hidden="true" />
		</button>
	);
}

export { AuthBackButton };
