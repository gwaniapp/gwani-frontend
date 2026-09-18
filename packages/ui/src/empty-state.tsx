import type { LucideIcon } from "lucide-react";

import { cn } from "./lib/utils";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

/**
 * The inline sibling to `StatusPage` — same icon-badge + heading +
 * description shape, sized for a section/list/table's own empty body
 * rather than a whole page (no `flex-1`/full-viewport padding). Every
 * "nothing here yet" spot in the app — an empty list, no results, nothing
 * created yet — should use this instead of a bare line of muted text, so
 * an empty state reads as a deliberate, finished part of the design rather
 * than a placeholder that was never filled in.
 */
function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
				className,
			)}
		>
			<span className="flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
				<Icon className="size-5" aria-hidden="true" />
			</span>
			<div className="flex flex-col gap-1">
				<h3 className="text-b2 font-semibold text-foreground sm:text-b1">{title}</h3>
				{description && (
					<p className="mx-auto max-w-xs text-c1 text-muted-foreground sm:text-b3">
						{description}
					</p>
				)}
			</div>
			{action}
		</div>
	);
}

export { EmptyState };
export type { EmptyStateProps };
