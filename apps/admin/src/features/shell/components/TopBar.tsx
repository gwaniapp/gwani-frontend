"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { Logo } from "@repo/ui/logo";
import { useAdminStats } from "@/features/admin/hooks/useAdminData";
import { MobileNav } from "@/features/shell/components/MobileNav";
import { NAV } from "@/features/shell/config";

/**
 * The slim bar above every page. Desktop: a breadcrumb ("Console › Users") and, when payments are frozen
 * by disputes, a red shortcut to them. Mobile: the hamburger and the logo. It stays put (sticky) with a
 * frosted background so the page scrolls underneath it.
 */
function TopBar() {
	const pathname = usePathname();
	const stats = useAdminStats();
	const current = NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
	const disputed = stats.data?.jobs.disputed ?? 0;

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-white/85 px-5 backdrop-blur lg:px-8">
			<div className="flex min-w-0 items-center gap-3">
				<MobileNav />
				<Link href="/dashboard" aria-label="Gwani admin" className="lg:hidden">
					<Logo size="lg" className="h-8" />
				</Link>
				<nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-b3 lg:flex">
					<span className="text-neutral-500">Console</span>
					<ChevronRight className="size-4 text-neutral-400" aria-hidden="true" />
					<span className="font-medium text-foreground">{current?.label ?? "Admin"}</span>
				</nav>
			</div>

			{disputed > 0 && (
				<Link
					href="/disputes"
					className="flex shrink-0 items-center gap-2 rounded-full border border-danger-200 bg-danger-50 px-3.5 py-1.5 text-c1 font-medium text-danger-700 outline-none transition-colors hover:bg-danger-100/60 focus-visible:ring-2 focus-visible:ring-danger-300 sm:text-b3"
				>
					<ShieldAlert className="size-4" aria-hidden="true" />
					{disputed === 1 ? "1 dispute" : `${disputed} disputes`}
					<span className="hidden sm:inline">need review</span>
				</Link>
			)}
		</header>
	);
}

export { TopBar };
