"use client";

import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { formatAmount } from "@/lib/format";

/**
 * The frame the job-action dialogs share (Mark as Completed, Fund escrow,
 * Release payment, Raise a dispute): a bordered header with title, one line of
 * explanation and a square close button, then the caller's body. `blockDismiss`
 * stops Esc/outside-click while a request is running, so nobody is left
 * guessing whether it went through.
 */
function JobDialog({
	open,
	onOpenChange,
	title,
	description,
	blockDismiss,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	blockDismiss?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl sm:p-0"
				onInteractOutside={(event) => blockDismiss && event.preventDefault()}
				onEscapeKeyDown={(event) => blockDismiss && event.preventDefault()}
			>
				<DialogHeader className="flex-row items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-10 sm:py-7">
					<div className="flex flex-col gap-1.5">
						<DialogTitle className="text-xl font-medium sm:text-xl sm:font-medium">{title}</DialogTitle>
						<DialogDescription className="text-b3 sm:text-b2">{description}</DialogDescription>
					</div>
					<DialogClose
						aria-label="Close"
						className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-neutral-600 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-200 sm:size-10 sm:rounded-xl"
					>
						<X className="size-5" aria-hidden="true" />
					</DialogClose>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}

/** The lavender "which job is this" card at the top of a job dialog: title (and client, when known) on the left, amount on the right. */
function JobSummary({ title, clientName, amount, asset }: { title: string; clientName?: string; amount: number; asset: string }) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-2xl bg-primary-100/30 p-4 sm:rounded-3xl sm:p-6">
			<div className="flex min-w-0 flex-col gap-2 sm:gap-3">
				<p className="truncate text-s1 font-medium text-foreground sm:text-xl sm:font-medium">{title}</p>
				{clientName && (
					<p className="text-b3 text-neutral-500 sm:text-b1">
						Client: <span className="text-foreground">{clientName}</span>
					</p>
				)}
			</div>
			<div className="flex shrink-0 flex-col items-end gap-1 sm:gap-2">
				<span className="text-b3 text-foreground sm:text-b1">Amount</span>
				<span className="text-s1 font-medium text-foreground sm:text-xl sm:font-medium">{formatAmount(amount, asset)}</span>
			</div>
		</div>
	);
}

export { JobDialog, JobSummary };
