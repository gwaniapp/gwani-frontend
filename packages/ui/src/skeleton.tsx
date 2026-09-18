import { cn } from "./lib/utils";

/** Loading placeholder — a sweeping highlight over a flat block, sized and
 * shaped via `className` to stand in for whatever it's loading. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"relative overflow-hidden rounded-md bg-neutral-100",
				className,
			)}
			{...props}
		>
			<span
				aria-hidden="true"
				className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent"
			/>
		</div>
	);
}

export { Skeleton };
