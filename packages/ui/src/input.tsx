import * as React from "react";

import { cn } from "./lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3.5 text-b1 text-foreground shadowxs transition-colors outline-none placeholder:text-b2 placeholder:text-neutral-200",
				"focus-visible:border-primary",
				"aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
				"disabled:cursor-not-allowed disabled:opacity-100 disabled:border-neutral-100 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:placeholder:text-neutral-300",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
