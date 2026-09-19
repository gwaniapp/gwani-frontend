import { cn } from "./lib/utils";

// Mirrors the backend's job state machine; declared here rather than imported
// because this package can't depend on the app's types.
type JobStatus =
	| "POSTED"
	| "PROVIDER_SELECTED"
	| "FUNDED"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "PAID"
	| "DISPUTED"
	| "CANCELLED";

/**
 * Label + tone per status — "Payment Secured" (funded, escrow locked) is green,
 * "Provider Selected" / "In Progress" are the warm orange from the dashboard
 * mock, and the rest follow the same tone logic (open = blue, finished (completed/paid) = green,
 * disputed = red, cancelled = grey). Keep these fixed everywhere a status shows.
 */
const STATUS_STYLES: Record<JobStatus, { label: string; className: string }> = {
	POSTED: { label: "Open", className: "bg-info-100 text-info-700" },
	PROVIDER_SELECTED: { label: "Provider Selected", className: "bg-orange-100 text-orange-600" },
	FUNDED: { label: "Payment Secured", className: "bg-success-100 text-success-700" },
	IN_PROGRESS: { label: "In Progress", className: "bg-orange-100 text-orange-600" },
	COMPLETED: { label: "Completed", className: "bg-success-100 text-success-700" },
	PAID: { label: "Paid", className: "bg-success-100 text-success-700" },
	DISPUTED: { label: "Disputed", className: "bg-danger-100 text-danger-700" },
	CANCELLED: { label: "Cancelled", className: "bg-muted text-neutral-500" },
};

function JobStatusBadge({
	status,
	className,
	...props
}: { status: JobStatus } & React.ComponentProps<"span">) {
	const { label, className: tone } = STATUS_STYLES[status];

	return (
		<span
			data-slot="job-status-badge"
			className={cn(
				"inline-flex w-fit shrink-0 items-center rounded-full px-4 py-1 text-b3 whitespace-nowrap",
				tone,
				className,
			)}
			{...props}
		>
			{label}
		</span>
	);
}

export { JobStatusBadge };
export type { JobStatus };
