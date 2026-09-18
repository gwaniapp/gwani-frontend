"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "./lib/utils";

interface CheckboxProps
	extends Omit<React.ComponentProps<"button">, "onClick" | "type" | "value"> {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

/** A single checkbox, styled as a button (role="checkbox") — the "tick" control from the Sign Up sheet. */
function Checkbox({
	checked,
	onCheckedChange,
	className,
	disabled,
	...props
}: CheckboxProps) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={checked}
			data-slot="checkbox"
			data-state={checked ? "checked" : "unchecked"}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"flex size-5 shrink-0 items-center justify-center rounded-md border border-input bg-background transition-colors outline-none",
				"focus-visible:ring-2 focus-visible:ring-primary-200",
				"data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500",
				"aria-invalid:border-destructive",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			{checked && (
				<Check
					className="size-3.5 text-primary-foreground"
					aria-hidden="true"
				/>
			)}
		</button>
	);
}

export { Checkbox };
export type { CheckboxProps };
