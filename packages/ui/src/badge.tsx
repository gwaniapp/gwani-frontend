import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";

/**
 * Generic status/label chip. Add product-specific variants (e.g. a status
 * enum badge pre-wired to the semantic tokens) once there's a real domain
 * to model — see peakline's `Badge`/`StatusBadge` for that pattern.
 */
const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-c2 whitespace-nowrap",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary-100 text-primary-800",
				secondary: "border-transparent bg-secondary-100 text-secondary-900",
				outline: "border-border bg-transparent text-foreground",
				success: "border-transparent bg-success-100 text-success-900",
				warning: "border-transparent bg-warning-100 text-warning-900",
				info: "border-transparent bg-info-100 text-info-900",
				destructive: "border-transparent bg-danger-100 text-danger-900",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface BadgeProps
	extends React.ComponentProps<"span">,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
