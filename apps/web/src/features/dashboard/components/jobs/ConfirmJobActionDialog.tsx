"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { JobDialog, JobSummary } from "@/features/dashboard/components/jobs/JobDialogParts";
import type { DashboardJob } from "@/lib/jobs";

interface ActionMutation {
	mutate: (variables: undefined, options: { onSuccess: () => void; onError: (error: unknown) => void }) => void;
	isPending: boolean;
	describe: (error: unknown) => string;
}

interface ConfirmJobActionDialogProps {
	job: DashboardJob;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	/** The question in bold, then a line of consequence under it. */
	question: string;
	detail: string;
	confirmLabel: string;
	successMessage: string;
	destructive?: boolean;
	mutation: ActionMutation;
}

/**
 * A plain confirm step for the job actions that have no design of their own
 * (fund escrow, release payment, raise a dispute) — the same frame as the
 * Mark-as-Completed dialog: which job and how much, what will happen, then
 * Cancel / confirm. The request's own error (e.g. "insufficient balance") shows
 * inside; success closes the dialog with a toast and the job page refreshes.
 */
function ConfirmJobActionDialog({
	job,
	open,
	onOpenChange,
	title,
	description,
	question,
	detail,
	confirmLabel,
	successMessage,
	destructive,
	mutation,
}: ConfirmJobActionDialogProps) {
	const [error, setError] = useState("");

	function confirm() {
		setError("");
		mutation.mutate(undefined, {
			onSuccess: () => {
				toast.success(successMessage);
				onOpenChange(false);
			},
			onError: (failure) => setError(mutation.describe(failure)),
		});
	}

	return (
		<JobDialog open={open} onOpenChange={(next) => { if (next) setError(""); onOpenChange(next); }} title={title} description={description} blockDismiss={mutation.isPending}>
			<div className="flex flex-col gap-6 px-5 py-6 sm:gap-8 sm:px-10 sm:py-8">
				<JobSummary title={job.title} amount={job.priceAmount} asset={job.priceAsset} />

				<div className="flex flex-col gap-2">
					<p className="text-b2 font-medium text-foreground sm:text-b1 sm:font-medium">{question}</p>
					<p className="text-b3 text-neutral-500 sm:text-b1">{detail}</p>
				</div>

				{error && (
					<p role="alert" className="text-b3 text-danger-600">
						{error}
					</p>
				)}

				<div className="flex flex-col-reverse gap-3 pt-2 sm:grid sm:grid-cols-[1fr_1.3fr] sm:gap-4 sm:pt-4">
					<Button type="button" variant="outline" size="giant" className="w-full rounded-lg" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						variant={destructive ? "destructive" : "primary"}
						size="giant"
						className="w-full rounded-lg"
						loading={mutation.isPending}
						onClick={confirm}
					>
						{confirmLabel}
						<Check className="size-5" aria-hidden="true" />
					</Button>
				</div>
			</div>
		</JobDialog>
	);
}

export { ConfirmJobActionDialog };
