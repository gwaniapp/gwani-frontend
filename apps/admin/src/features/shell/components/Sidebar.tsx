"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Logo } from "@repo/ui/logo";
import { ConfirmLogoutDialog } from "@/features/auth/components/ConfirmLogoutDialog";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useAdminStats } from "@/features/admin/hooks/useAdminData";
import { NAV } from "@/features/shell/config";
import { initials } from "@/lib/format";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Everything in the console's left column, shared by the fixed desktop sidebar and the mobile slide-in
 * menu (`onNavigate` lets the latter close itself): the brand, the pages — with a live count on Disputes
 * so a frozen payment is never out of sight — and, pinned to the bottom, who is signed in and Logout
 * (which asks first).
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname();
	const { user } = useCurrentUser();
	const logout = useLogout(onNavigate);
	const stats = useAdminStats();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const disputed = stats.data?.jobs.disputed ?? 0;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex shrink-0 items-center gap-3 px-6 pt-6 pb-5">
				<Link href="/dashboard" onClick={onNavigate} aria-label="Gwani admin — overview" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-300">
					<Logo size="lg" className="h-9 md:h-9" />
				</Link>
				<span className="rounded-full bg-primary-100/60 px-2.5 py-0.5 text-c1 font-medium text-primary-600">Admin</span>
			</div>

			<nav aria-label="Console" className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
				<p className="px-3 pb-2 text-c1 font-medium tracking-wide text-neutral-500 uppercase">Manage</p>
				<ul className="flex flex-col gap-1">
					{NAV.map(({ label, href, icon: Icon }) => {
						const active = isActive(pathname, href);
						return (
							<li key={href}>
								<Link
									href={href}
									onClick={onNavigate}
									aria-current={active ? "page" : undefined}
									className={cn(
										"flex h-11 w-full items-center gap-3 rounded-lg px-3 text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300",
										active ? "bg-primary-100/60 font-medium text-primary-600" : "text-foreground hover:bg-muted",
									)}
								>
									<Icon className="size-[18px] shrink-0" aria-hidden="true" />
									<span className="flex-1">{label}</span>
									{href === "/disputes" && disputed > 0 && (
										<span className="flex min-w-5 items-center justify-center rounded-full bg-danger-500 px-1.5 text-c3 text-white" aria-label={`${disputed} open`}>
											{disputed > 99 ? "99+" : disputed}
										</span>
									)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="shrink-0 border-t border-border p-4">
				<div className="flex items-center gap-3 rounded-xl px-2 py-2">
					<span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-b4 text-white">
						{user ? initials(user.first_name, user.last_name) : ""}
					</span>
					<div className="flex min-w-0 flex-col leading-tight">
						<span className="truncate text-b3 font-medium text-foreground">{user ? `${user.first_name} ${user.last_name}` : ""}</span>
						<span className="truncate text-c1 text-neutral-500">{user?.email ?? ""}</span>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setConfirmOpen(true)}
					className="mt-2 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-b3 text-danger-600 outline-none transition-colors hover:bg-danger-50 focus-visible:ring-2 focus-visible:ring-primary-300"
				>
					<LogOut className="size-[18px] shrink-0" aria-hidden="true" />
					Logout
				</button>
			</div>
			<ConfirmLogoutDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={logout} />
		</div>
	);
}

export { SidebarContent };
