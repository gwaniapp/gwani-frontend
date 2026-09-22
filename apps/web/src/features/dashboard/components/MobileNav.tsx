"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog";
import { Logo } from "@repo/ui/logo";
import { DashboardNav } from "@/features/dashboard/components/DashboardNav";
import { DASHBOARD_CONFIG, type DashboardRole } from "@/features/dashboard/config";

// The panel and its backdrop share these so they move as one: a slower,
// eased-out entrance and a quicker exit (the default 150ms read as a snap).
const ENTER = "data-[state=open]:duration-300 data-[state=open]:ease-out";
const EXIT = "data-[state=closed]:duration-200 data-[state=closed]:ease-in";

/** Hamburger + slide-in menu, for screens too narrow for the sidebar. */
function MobileNav({ role }: { role: DashboardRole }) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label="Open menu"
					className="flex size-10 items-center justify-center rounded-lg text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary-300 lg:hidden"
				>
					<Menu className="size-6" aria-hidden="true" />
				</button>
			</DialogTrigger>
			<DialogContent
				aria-describedby={undefined}
				overlayClassName={`${ENTER} ${EXIT}`}
				// Focus the panel, not whichever control Radix would pick (it was landing on Logout, ring and all).
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.target as HTMLElement).focus();
				}}
				className={`top-0 left-0 h-dvh max-h-none w-[min(19rem,85vw)] max-w-none translate-x-0 translate-y-0 content-start gap-0 rounded-none rounded-r-3xl p-5 shadow-2xl sm:max-w-none sm:p-5 data-[state=open]:zoom-in-100 data-[state=open]:fade-in-100 data-[state=open]:slide-in-from-left data-[state=closed]:zoom-out-100 data-[state=closed]:fade-out-100 data-[state=closed]:slide-out-to-left ${ENTER} ${EXIT}`}
			>
				<DialogTitle className="sr-only">Menu</DialogTitle>
				<div className="mb-8 flex items-center gap-2.5">
					<Logo size="lg" className="h-9 md:h-9" />
					<span className="rounded-full bg-primary-100/60 px-2.5 py-0.5 text-c1 font-medium text-primary-600">{DASHBOARD_CONFIG[role].label}</span>
				</div>
				<DashboardNav role={role} onNavigate={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

export { MobileNav };
