import { SidebarContent } from "@/features/shell/components/Sidebar";
import { TopBar } from "@/features/shell/components/TopBar";

/**
 * The console frame: from `lg` a fixed full-height sidebar (brand, pages, the signed-in admin and
 * Logout) with a sticky top bar and the page beside it; below `lg` the sidebar becomes a slide-in menu
 * behind the top bar's hamburger. Pages sit on the tinted background as cards, in a column capped at
 * `max-w-7xl` so tables and forms stay readable on very wide screens. The sidebar's width (`w-64`)
 * and the content's left padding (`lg:pl-64`) must match.
 */
function AdminShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-primary-100/10">
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-white lg:block">
				<SidebarContent />
			</aside>

			<div className="flex min-h-dvh flex-col lg:pl-64">
				<TopBar />
				<main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
			</div>
		</div>
	);
}

export { AdminShell };
