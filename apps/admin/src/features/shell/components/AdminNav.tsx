"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { ConfirmLogoutDialog } from "@/features/auth/components/ConfirmLogoutDialog";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { NAV } from "@/features/shell/config";

const ITEM =
	"flex h-12 w-full items-center gap-3 rounded-lg px-4.5 text-b3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** The console menu — the sidebar on desktop and the contents of the slide-in menu on mobile (`onNavigate` lets that one close itself). */
function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname();
	const logout = useLogout(onNavigate);
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<nav aria-label="Console" className="flex flex-col">
			<p className="text-b1 text-foreground">Menu</p>
			<ul className="mt-6 flex flex-col gap-2.5">
				{NAV.map(({ label, href, icon: Icon }) => {
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
				})}
			</ul>

			<p className="mt-12 text-b1 text-foreground">General</p>
			<ul className="mt-6 flex flex-col gap-2.5">
				<li>
					<button type="button" onClick={() => setConfirmOpen(true)} className={cn(ITEM, "text-danger-600 hover:bg-danger-50")}>
						<LogOut className="size-4" aria-hidden="true" />
						Logout
					</button>
				</li>
			</ul>
			<ConfirmLogoutDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={logout} />
		</nav>
	);
}

export { AdminNav };
