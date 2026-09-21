import Link from "next/link";
import { Logo } from "@repo/ui/logo";
import { AdminNav } from "@/features/shell/components/AdminNav";
import { HeaderUser } from "@/features/shell/components/HeaderUser";
import { MobileNav } from "@/features/shell/components/MobileNav";

/**
 * The console frame, in the Gwani dashboards' floating-card style: from `lg` the logo sits on the
 * page beside a header card (the signed-in admin), with a menu card down the left and the page in a
 * bordered card. The header row and the menu card are `fixed`, and the content column reserves their
 * space with `pt-36.5` (146px: 20 top + 98 header card + 28 gap) and `pl-67` (268px: 20 + 228 menu +
 * 20 gap) — keep those in sync with the sizes below. Below `lg` it's a logo + hamburger header.
 */
function AdminShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-primary-100/10">
			<header className="fixed inset-x-0 top-0 z-30 bg-white">
				<div className="bg-primary-100/10 px-5 lg:pt-5 lg:pb-7">
					<div className="flex h-16 items-center justify-between lg:h-24.5">
						<Link href="/dashboard" aria-label="Gwani admin" className="ml-0.5 flex items-center gap-3">
							<Logo size="lg" className="h-9 md:h-9 lg:h-13" />
							<span className="hidden rounded-full bg-primary-100/60 px-3 py-1 text-c1 text-primary-600 sm:inline">Admin</span>
						</Link>
						<MobileNav />
						<div className="hidden h-full w-64 items-center justify-end rounded-3xl border border-border bg-white px-7.5 lg:flex">
							<HeaderUser />
						</div>
					</div>
				</div>
			</header>

			<aside className="fixed top-36.5 bottom-5 left-5 z-20 hidden w-57 overflow-y-auto rounded-3xl border border-border bg-white p-3.5 lg:block">
				<AdminNav />
			</aside>

			<div className="pt-16 lg:pt-36.5 lg:pr-5 lg:pb-5 lg:pl-67">
				<main className="min-w-0 px-5 pt-5 pb-8 lg:p-0">
					<div className="lg:min-h-[calc(100dvh-10.375rem)] lg:rounded-3xl lg:border lg:border-border lg:bg-white lg:p-7.5">{children}</div>
				</main>
			</div>
		</div>
	);
}

export { AdminShell };
