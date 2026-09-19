"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, Headset, LayoutGrid, LogOut, Settings, User, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";

interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
}

const DASHBOARD_HOME = "/provider/dashboard";

// Everything but Overview lives at a screen that isn't designed yet.
const MENU: NavItem[] = [
	{ label: "Overview", href: DASHBOARD_HOME, icon: LayoutGrid },
	{ label: "My Jobs", href: `${DASHBOARD_HOME}/jobs`, icon: Briefcase },
	{ label: "Profile", href: `${DASHBOARD_HOME}/profile`, icon: User },
	{ label: "Wallet", href: `${DASHBOARD_HOME}/wallet`, icon: Wallet },
];

const GENERAL: NavItem[] = [
	{ label: "Settings", href: `${DASHBOARD_HOME}/settings`, icon: Settings },
	{ label: "Help", href: `${DASHBOARD_HOME}/help`, icon: Headset },
];

const ITEM = "flex h-12 w-full items-center gap-3 rounded-lg px-4.5 text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300";

function isActive(pathname: string, href: string) {
	return href === DASHBOARD_HOME ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The dashboard menu — the sidebar on desktop and the contents of the slide-in
 * menu on mobile (`onNavigate` lets that one close itself).
 */
function DashboardNav({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname();
	const router = useRouter();
	const clearSession = useAuthStore((state) => state.clear);

	function logout() {
		clearSession();
		onNavigate?.();
		router.push("/auth/sign-in");
	}

	function renderItems(items: NavItem[]) {
		return items.map(({ label, href, icon: Icon }) => {
			const active = isActive(pathname, href);
			return (
				<li key={href}>
					<Link
						href={href}
						onClick={onNavigate}
						aria-current={active ? "page" : undefined}
						className={cn(ITEM, active ? "bg-primary-100/60 text-primary-600" : "text-foreground hover:bg-muted")}
					>
						<Icon className="size-4" aria-hidden="true" />
						{label}
					</Link>
				</li>
			);
		});
	}

	return (
		<nav aria-label="Dashboard" className="flex flex-col">
			<p className="text-b1 text-foreground">Menu</p>
			<ul className="mt-6 flex flex-col gap-2.5">{renderItems(MENU)}</ul>

			<p className="mt-12 text-b1 text-foreground">General</p>
			<ul className="mt-6 flex flex-col gap-2.5">
				{renderItems(GENERAL)}
				<li>
					<button
						type="button"
						onClick={logout}
						className={cn(ITEM, "text-danger-600 hover:bg-danger-50")}
					>
						<LogOut className="size-4" aria-hidden="true" />
						Logout
					</button>
				</li>
			</ul>
		</nav>
	);
}

export { DashboardNav, DASHBOARD_HOME };
