"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/ui/dialog";
import { Logo } from "@repo/ui/logo";
import { AdminNav } from "@/features/shell/components/AdminNav";

// The panel and its backdrop share these so they move as one: a slower, eased-out entrance and a quicker exit.
const ENTER = "data-[state=open]:duration-300 data-[state=open]:ease-out";
const EXIT = "data-[state=closed]:duration-200 data-[state=closed]:ease-in";

/** Hamburger + slide-in menu, for screens too narrow for the sidebar. */
function MobileNav() {
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
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					(event.target as HTMLElement).focus();
				}}
				className={`top-0 left-0 h-dvh max-h-none w-[min(19rem,85vw)] max-w-none translate-x-0 translate-y-0 content-start gap-0 rounded-none rounded-r-3xl p-5 shadow-2xl sm:max-w-none sm:p-5 data-[state=open]:zoom-in-100 data-[state=open]:fade-in-100 data-[state=open]:slide-in-from-left data-[state=closed]:zoom-out-100 data-[state=closed]:fade-out-100 data-[state=closed]:slide-out-to-left ${ENTER} ${EXIT}`}
			>
				<DialogTitle className="sr-only">Menu</DialogTitle>
				<Logo size="lg" className="mb-8 h-9 md:h-9" />
				<AdminNav onNavigate={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

export { MobileNav };
