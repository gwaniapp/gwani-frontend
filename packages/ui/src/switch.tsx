"use client";

import * as React from "react";

import { cn } from "./lib/utils";

interface SwitchProps extends Omit<React.ComponentProps<"button">, "onChange"> {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

/**
 * A real sliding toggle — green track + white knob when on. First use:
 * Account Settings' own Two-Factor Authentication row, which only ever
 * *shows* this in the on position (see that row's own note — off state is
 * a plain "Enable" button instead, not this switch flipped off), but built
 * as a genuine controlled on/off control rather than a one-state visual,
 * since nothing rules out a second caller wanting the real off state too.
 */
function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none",
				"focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2",
				checked ? "bg-primary-500" : "bg-neutral-200",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					"inline-block size-5.5 translate-x-1 rounded-full bg-white shadow transition-transform",
					checked && "translate-x-5.5",
				)}
			/>
		</button>
	);
}

export { Switch };
