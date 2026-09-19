import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "./lib/utils";

/**
 * A native `<select>` styled to match `Input` — no listbox/combobox behavior,
 * just the platform picker with our chrome around it. Good enough for a
 * short, plain options list (e.g. document type); reach for something
 * heavier only once a screen actually needs search or multi-select.
 */
function Select({
	className,
	children,
	...props
}: React.ComponentProps<"select">) {
	// An empty value means the placeholder option is showing — dim it like an Input placeholder.
	// Give real `<option>`s `className="text-foreground"`: some browsers colour the open list like the select.
	return (
		<div className="relative">
			<select
				data-slot="select"
				className={cn(
					"flex h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent px-3.5 pr-10 text-b1 text-foreground shadow-xs transition-colors outline-none",
					props.value === "" && "text-neutral-300",
					"focus-visible:border-primary",
					"aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive",
					"disabled:cursor-not-allowed disabled:opacity-100 disabled:border-muted disabled:bg-muted disabled:text-neutral-400",
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDown
				className="pointer-events-none absolute inset-y-0 right-3.5 my-auto size-4 text-muted-foreground"
				aria-hidden="true"
			/>
		</div>
	);
}

export { Select };
