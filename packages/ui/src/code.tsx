import { cn } from "./lib/utils";

/**
 * Monospace inline chip — for hashes, reference IDs, or any short code-like
 * value that should render in a fixed-width font.
 */
function Code({ className, ...props }: React.ComponentProps<"code">) {
	return (
		<code
			data-slot="code"
			className={cn(
				"rounded-md bg-muted px-1.5 py-0.5 font-mono text-c1 text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { Code };
