import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "./lib/utils";

/**
 * Sizes match the Figma "Button" sheet (Giant/Large/Medium/Small/Tiny),
 * each paired with its Button Font token (text-btn-*). States (Default,
 * Hover, Focus, Press, Disabled) are all full-saturation per variant —
 * disabled always renders as flat neutral gray, never a dimmed brand color.
 */
const buttonVariants = cva(
	"relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-colors outline-none disabled:pointer-events-none disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ",
	{
		variants: {
			variant: {
				primary:
					"bg-primary-500 text-primary-foreground hover:bg-primary-700 active:bg-primary-800 focus-visible:bg-primary-700 focus-visible:ring-primary-300 disabled:bg-neutral-200 disabled:text-neutral-400",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary-600 active:bg-secondary-700 focus-visible:bg-secondary-600 focus-visible:ring-secondary-300 disabled:bg-neutral-200 disabled:text-neutral-400",
				outline:
					"border border-border bg-transparent text-foreground hover:bg-muted active:bg-neutral-100 focus-visible:bg-muted focus-visible:ring-primary-200 disabled:bg-transparent disabled:border-neutral-200 disabled:text-neutral-400",
				ghost:
					"bg-transparent text-foreground hover:bg-muted active:bg-neutral-100 focus-visible:bg-muted focus-visible:ring-primary-200 disabled:bg-transparent disabled:text-neutral-400",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-danger-700 active:bg-danger-800 focus-visible:bg-danger-700 focus-visible:ring-danger-200 disabled:bg-neutral-200 disabled:text-neutral-400",
				link: "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto disabled:text-neutral-400",
			},
			size: {
				giant: "h-14 px-7 text-btn-giant rounded-xl",
				large: "h-12 px-6 text-btn-large",
				medium: "h-11 px-4 text-btn-medium",
				small: "h-9 px-3 text-btn-small",
				tiny: "h-8 px-2.5 text-btn-tiny",
			},
			iconOnly: {
				true: "aspect-square px-0",
				false: "",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "medium",
			iconOnly: false,
		},
	},
);

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	/** Shows a spinner in place of the label and disables the button, without changing its size. */
	loading?: boolean;
}

function Button({
	className,
	variant,
	size,
	iconOnly,
	asChild = false,
	loading = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	if (asChild) {
		return (
			<Slot
				data-slot="button"
				className={cn(buttonVariants({ variant, size, iconOnly, className }))}
				{...props}
			>
				{children}
			</Slot>
		);
	}

	return (
		<button
			data-slot="button"
			className={cn(buttonVariants({ variant, size, iconOnly, className }))}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			<span
				className={cn(
					"inline-flex items-center gap-2",
					loading && "invisible",
				)}
			>
				{children}
			</span>
			{loading && (
				<Loader2
					className="absolute size-4 animate-spin"
					aria-hidden="true"
				/>
			)}
		</button>
	);
}

export { Button, buttonVariants };
export type { ButtonProps };
