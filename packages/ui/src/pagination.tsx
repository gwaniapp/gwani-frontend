"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "./lib/utils";

/** Which page buttons to show: all of them when few, otherwise first, last and the current page's neighbours (`null` = a gap). */
function visiblePages(page: number, pageCount: number): Array<number | null> {
	if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
	const pages = new Set([1, pageCount, page - 1, page, page + 1]);
	const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
	const out: Array<number | null> = [];
	sorted.forEach((p, i) => {
		if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push(null);
		out.push(p);
	});
	return out;
}

interface PaginationProps {
	/** Current page, 1-based. */
	page: number;
	pageCount: number;
	onPageChange: (page: number) => void;
	className?: string;
}

const CONTROL =
	"flex size-8 items-center justify-center rounded-md text-b3 text-neutral-500 outline-none transition-colors hover:bg-primary-100/50 focus-visible:ring-2 focus-visible:ring-primary-300 disabled:pointer-events-none disabled:opacity-40";

/** Prev / numbered / next page controls (the current page is the filled one). */
function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
	return (
		<nav aria-label="Pagination" className={cn("flex items-center gap-1 rounded-lg bg-primary-100/40 p-1", className)}>
			<button
				type="button"
				className={CONTROL}
				aria-label="Previous page"
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
			>
				<ChevronLeft className="size-4" aria-hidden="true" />
			</button>
			{visiblePages(page, pageCount).map((p, index) =>
				p === null ? (
					<span key={`gap-${index}`} className="flex size-8 items-center justify-center text-neutral-400" aria-hidden="true">
						…
					</span>
				) : (
					<button
						key={p}
						type="button"
						aria-current={p === page ? "page" : undefined}
						aria-label={`Page ${p}`}
						className={cn(CONTROL, p === page && "bg-primary-500 text-white hover:bg-primary-500")}
						onClick={() => onPageChange(p)}
					>
						{p}
					</button>
				),
			)}
			<button
				type="button"
				className={CONTROL}
				aria-label="Next page"
				disabled={page >= pageCount}
				onClick={() => onPageChange(page + 1)}
			>
				<ChevronRight className="size-4" aria-hidden="true" />
			</button>
		</nav>
	);
}

export { Pagination };
export type { PaginationProps };
