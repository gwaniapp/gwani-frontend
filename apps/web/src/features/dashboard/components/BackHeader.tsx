import Link from "next/link";
import { Undo2 } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

/**
 * A round back button with a label, at the top of a page inside the page card
 * ("Back to providers", "Post a New Job"). A plain link to a fixed parent
 * rather than `router.back()`, so it always goes somewhere predictable (the
 * cost: it doesn't restore a filtered/paged list).
 */
function BackHeader({ href, label, className, as: Heading = "p" }: { href: string; label: string; className?: string; as?: "p" | "h1" }) {
	return (
		<div className={cn("flex items-center gap-3 lg:gap-4", className)}>
			<Link
				href={href}
				aria-label={`Back: ${label}`}
				className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground outline-none transition-colors hover:bg-primary-100/50 focus-visible:ring-2 focus-visible:ring-primary-300 lg:size-12"
			>
				<Undo2 className="size-5 lg:size-6" aria-hidden="true" />
			</Link>
			<Heading className="text-b3 text-foreground lg:text-xl">{label}</Heading>
		</div>
	);
}

export { BackHeader };
