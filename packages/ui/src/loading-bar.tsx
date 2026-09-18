import { cn } from "./lib/utils";

/** Indeterminate linear progress — the moving-segment bar from the loading screen mockup. */
function LoadingBar({ className }: { className?: string }) {
	return (
		<div
			role="progressbar"
			aria-label="Loading"
			className={cn(
				"relative h-1 w-52 overflow-hidden rounded-full bg-neutral-100",
				className,
			)}
		>
			<span className="absolute inset-y-0 w-2/5 rounded-full bg-primary animate-loading-bar" />
		</div>
	);
}

export { LoadingBar };
