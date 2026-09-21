import { LayoutGrid, ScrollText, ShieldAlert, Users, Briefcase, type LucideIcon } from "lucide-react";

export interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
}

/** The console's pages. Add a page and, if it belongs in the menu, list it here. */
export const NAV: NavItem[] = [
	{ label: "Overview", href: "/dashboard", icon: LayoutGrid },
	{ label: "Users", href: "/users", icon: Users },
	{ label: "Jobs", href: "/jobs", icon: Briefcase },
	{ label: "Disputes", href: "/disputes", icon: ShieldAlert },
	{ label: "Audit log", href: "/audit-log", icon: ScrollText },
];
