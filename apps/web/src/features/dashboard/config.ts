import { Briefcase, Headset, LayoutGrid, Settings, User, UserSearch, Wallet, type LucideIcon } from "lucide-react";

import type { UserRole } from "@/lib/api/types";

export type DashboardRole = "provider" | "client";

export interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
}

interface DashboardConfig {
	home: string;
	/** Shown next to the logo (`DashboardShell`, `MobileNav`) so it's obvious at a glance which dashboard this is. */
	label: string;
	menu: NavItem[];
	general: NavItem[];
}

const providerHome = "/provider/dashboard";
const clientHome = "/client/dashboard";

const general = (home: string): NavItem[] => [
	{ label: "Settings", href: `${home}/settings`, icon: Settings },
	{ label: "Help", href: `${home}/help`, icon: Headset },
];

/**
 * One dashboard frame, two menus. Only some of these screens exist yet — the
 * rest hit the branded 404 — so add a page here and it's already linked. The
 * client's "Jobs" is a different screen from the provider's "My Jobs".
 */
export const DASHBOARD_CONFIG: Record<DashboardRole, DashboardConfig> = {
	provider: {
		home: providerHome,
		label: "Provider",
		menu: [
			{ label: "Overview", href: providerHome, icon: LayoutGrid },
			{ label: "My Jobs", href: `${providerHome}/jobs`, icon: Briefcase },
			{ label: "Profile", href: `${providerHome}/profile`, icon: User },
			{ label: "Wallet", href: `${providerHome}/wallet`, icon: Wallet },
		],
		general: general(providerHome),
	},
	client: {
		home: clientHome,
		label: "Client",
		menu: [
			{ label: "Overview", href: clientHome, icon: LayoutGrid },
			{ label: "Find Providers", href: `${clientHome}/providers`, icon: UserSearch },
			{ label: "Jobs", href: `${clientHome}/jobs`, icon: Briefcase },
			{ label: "Profile", href: `${clientHome}/profile`, icon: User },
			{ label: "Wallet", href: `${clientHome}/wallet`, icon: Wallet },
		],
		general: general(clientHome),
	},
};

/** Where a signed-in user lands. Admins have their own app, so they have no dashboard here (`null`). */
export function dashboardHomeFor(role: UserRole): string | null {
	if (role === "CLIENT") return DASHBOARD_CONFIG.client.home;
	if (role === "PROVIDER") return DASHBOARD_CONFIG.provider.home;
	return null;
}
