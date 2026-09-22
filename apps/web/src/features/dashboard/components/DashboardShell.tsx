import Link from "next/link";
import { Logo } from "@repo/ui/logo";
import { DashboardNav } from "@/features/dashboard/components/DashboardNav";
import { DASHBOARD_CONFIG, type DashboardRole } from "@/features/dashboard/config";
import { HeaderBackButton } from "@/features/dashboard/components/HeaderBackButton";
import { HeaderSearch } from "@/features/dashboard/components/HeaderSearch";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { MobileNav } from "@/features/dashboard/components/MobileNav";
import { HeaderUser } from "@/features/dashboard/components/HeaderActions";

/**
 * Dashboard frame (provider or client — `role` picks the menu), in the design's floating-card style: from `lg` the
 * logo sits on the page beside a header card (search, bell, user), with a menu
 * card down the left and the page in a bordered card. The header row and the
 * menu card are `fixed` — they stay put while the page scrolls, and the menu
 * card runs down to the bottom of the screen. `fixed` rather than `sticky` so
 * nothing an ancestor does with overflow (a dialog locking body scroll) can
 * move them; the content column reserves their space with `pt-36.5` (146px:
 * 20px top + 98px header card + 28px gap) and `pl-67` (268px: 20px + 228px
 * menu + 20px gap), which must match the sizes below.
 *
 * The header row is a solid strip (white under the page tint) so scrolled
 * content disappears behind it instead of showing around the floating card.
 * Below `lg` it's just the logo + hamburger, and pages show the bell + avatar
 * themselves.
 */
function DashboardShell({ role, children }: { role: DashboardRole; children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-primary-100/10">
			<header className="fixed inset-x-0 top-0 z-30 bg-white">
				<div className="bg-primary-100/10 px-5 lg:pt-5 lg:pb-7">
					<div className="flex h-16 items-center justify-between lg:h-24.5">
						<div className="flex items-center gap-3 lg:gap-5">
							<Link href={DASHBOARD_CONFIG[role].home} aria-label="Gwani dashboard" className="ml-0.5 flex items-center gap-2.5">
								<Logo size="lg" className="h-9 md:h-9 lg:h-13" />
								<span className="rounded-full bg-primary-100/60 px-2.5 py-0.5 text-c1 font-medium text-primary-600">{DASHBOARD_CONFIG[role].label}</span>
							</Link>
							<HeaderBackButton />
						</div>
						<MobileNav role={role} />
						<div className="hidden h-full w-164 items-center gap-6 rounded-3xl border border-border bg-white px-7.5 lg:flex">
							<HeaderSearch role={role} />
							<NotificationBell role={role} className="size-14" />
							<HeaderUser />
						</div>
					</div>
				</div>
			</header>

			<aside className="fixed top-36.5 bottom-5 left-5 z-20 hidden w-57 overflow-y-auto rounded-3xl border border-border bg-white p-3.5 lg:block">
				<DashboardNav role={role} />
			</aside>

			<div className="pt-16 lg:pt-36.5 lg:pr-5 lg:pb-5 lg:pl-67">
				<main className="min-w-0 px-5 pt-5 pb-8 lg:p-0">
					<div className="lg:min-h-[calc(100dvh-10.375rem)] lg:rounded-3xl lg:border lg:border-border lg:bg-white lg:p-7.5">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}

export { DashboardShell };
