import * as React from "react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";

/**
 * Inline banner version of the Alert sheet — same visual language as the
 * Toaster (halo icon badge + colored text on a tint), usable wherever a
 * persistent (non-dismissing-on-its-own) message is needed instead of a
 * toast, e.g. a form-level warning or a dashboard notice.
 */
const alertVariants = cva(
	"flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-b4",
	{
		variants: {
			variant: {
				success: "bg-success-100 text-success-800",
				info: "bg-info-100 text-info-800",
				warning: "bg-warning-100 text-warning-900",
				error: "bg-danger-100 text-danger-800",
			},
		},
		defaultVariants: {
			variant: "info",
		},
	},
);

const ICONS = {
	success: CircleCheck,
	info: Info,
	warning: TriangleAlert,
	error: TriangleAlert,
} as const;

const HALO_BADGE = {
	success: "bg-success-200",
	info: "bg-info-200",
	warning: "bg-warning-200",
	error: "bg-danger-200",
} as const;

const SOLID_BADGE = {
	success: "bg-success-600",
	info: "bg-info-600",
	warning: "bg-warning-600",
	error: "bg-danger-600",
} as const;

type AlertVariant = keyof typeof ICONS;

/** The soft halo + solid inner badge icon treatment from the sheet — shared with the Toaster. */
function AlertIcon({ variant }: { variant: AlertVariant }) {
	const Icon = ICONS[variant];
	return (
		<span
			className={cn(
				"flex size-10 shrink-0 items-center justify-center rounded-full",
				HALO_BADGE[variant],
			)}
		>
			<span
				className={cn(
					"flex size-6 items-center justify-center rounded-full",
					SOLID_BADGE[variant],
				)}
			>
				<Icon className="size-3.5 text-white" aria-hidden="true" />
			</span>
		</span>
	);
}

interface AlertProps
	extends React.ComponentProps<"div">,
		VariantProps<typeof alertVariants> {
	onDismiss?: () => void;
}

function Alert({
	className,
	variant,
	onDismiss,
	children,
	...props
}: AlertProps) {
	const resolvedVariant = variant ?? "info";

	return (
		<div
			data-slot="alert"
			role="status"
			className={cn(alertVariants({ variant: resolvedVariant, className }))}
			{...props}
		>
			<AlertIcon variant={resolvedVariant} />
			<span className="flex-1">{children}</span>
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					aria-label="Dismiss"
					className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
				>
					<X className="size-5" aria-hidden="true" />
				</button>
			)}
		</div>
	);
}

export { Alert, alertVariants, AlertIcon };
export type { AlertProps, AlertVariant };
