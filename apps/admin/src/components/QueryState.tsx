"use client";

import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";

/** Placeholder rows while a list loads — same rounded-card look as the real ones, so nothing jumps. */
function ListSkeleton({ rows = 3, className, rowClassName }: { rows?: number; className?: string; rowClassName?: string }) {
	return (
		<div className={cn("flex flex-col gap-5", className)} aria-busy="true" aria-label="Loading">
			{Array.from({ length: rows }, (_, index) => (
				<Skeleton key={index} className={cn("h-32 w-full rounded-2xl md:rounded-3xl", rowClassName)} />
			))}
		</div>
	);
}

/** Something failed to load: say so plainly and offer a retry (the page's own layout stays). */
function QueryError({ message = "We couldn't load this right now.", onRetry, className }: { message?: string; onRetry: () => void; className?: string }) {
	return (
		<div role="alert" className={cn("flex flex-col items-start gap-3 rounded-2xl border border-danger-100 bg-danger-50/40 p-5", className)}>
			<p className="text-b3 text-danger-700 lg:text-b1">{message}</p>
			<Button type="button" variant="outline" size="medium" onClick={onRetry}>
				Try again
			</Button>
		</div>
	);
}

export { ListSkeleton, QueryError };
