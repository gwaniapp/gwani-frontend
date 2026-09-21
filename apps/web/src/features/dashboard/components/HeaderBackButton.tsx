"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Undo2 } from "lucide-react";

// Pages that sit one level below a list and get a back button beside the logo.
const BACK_TARGETS: Array<{ match: RegExp; href: string; label: string }> = [
	{ match: /^\/provider\/dashboard\/jobs\/[^/]+$/, href: "/provider/dashboard/jobs", label: "Back to jobs" },
	// `/jobs/new` has its own in-page back header.
	{ match: /^\/client\/dashboard\/jobs\/(?!new$)[^/]+$/, href: "/client/dashboard/jobs", label: "Back to jobs" },
];

/** The round back button next to the logo on detail pages (nothing elsewhere). */
function HeaderBackButton() {
	const pathname = usePathname();
	const target = BACK_TARGETS.find((item) => item.match.test(pathname));
	if (!target) return null;

	return (
		<Link
			href={target.href}
			aria-label={target.label}
			className="flex size-10 items-center justify-center rounded-full bg-primary-100/50 text-foreground outline-none transition-colors hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-300 lg:size-14"
		>
			<Undo2 className="size-5 lg:size-6" aria-hidden="true" />
		</Link>
	);
}

export { HeaderBackButton };
