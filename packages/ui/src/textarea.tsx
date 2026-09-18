import * as React from "react";

import { cn } from "./lib/utils";

/** `Input`'s multi-line counterpart — same chrome, a min height instead of
 * a fixed one. First real use: the admin console's reason field on every
 * moderation action (lock, suspend, reverse, ...). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex min-h-24 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-b1 text-foreground shadow-xs transition-colors outline-none placeholder:text-b2 placeholder:text-neutral-200",
				"focus-visible:border-primary",
				"aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
				"disabled:cursor-not-allowed disabled:opacity-100 disabled:border-neutral-100 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:placeholder:text-neutral-300",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
