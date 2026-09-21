"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { Textarea } from "@repo/ui/textarea";
import { JobDialog, JobSummary } from "@/features/dashboard/components/jobs/JobDialogParts";
import type { DashboardJob } from "@/lib/jobs";

interface ActionMutation {
	mutate: (variables: { reason?: string } | undefined, options: { onSuccess: () => void; onError: (error: unknown) => void }) => void;
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
	/** Asks for a written reason first (raise a dispute: 10–1000 characters, sent as `{ reason }`). */
	reason?: { label: string; placeholder: string; min: number; max: number };
	mutation: ActionMutation;
}

/**
 * A plain confirm step for the job actions that have no design of their own
 * (fund escrow, release payment, raise a dispute) — the same frame as the
 * Mark-as-Completed dialog: which job and how much, what will happen, then
 * Cancel / confirm. The request's own error (e.g. "insufficient balance") shows
 * inside; success closes the dialog with a toast and the job page refreshes. With
 * `reason` it also asks for a written reason (a dispute needs one) and checks its
 * length before anything is sent.
 *
 * The typed reason and any error live in the *body*, which the dialog unmounts when
 * it closes, so every opening starts clean (however it was opened).
 */
function ConfirmJobActionDialog(props: ConfirmJobActionDialogProps) {
	const { open, onOpenChange, title, description, mutation } = props;

	return (
		<JobDialog open={open} onOpenChange={onOpenChange} title={title} description={description} blockDismiss={mutation.isPending}>
			<ConfirmBody {...props} />
		</JobDialog>
	);
}

function ConfirmBody({ job, onOpenChange, question, detail, confirmLabel, successMessage, destructive, reason, mutation }: ConfirmJobActionDialogProps) {
	const [error, setError] = useState("");
	const [text, setText] = useState("");

	function confirm() {
		setError("");
		const trimmed = text.trim();
		if (reason && (trimmed.length < reason.min || trimmed.length > reason.max)) {
			setError(`Tell us what went wrong, in ${reason.min} to ${reason.max.toLocaleString("en")} characters.`);
			return;
		}
		mutation.mutate(reason ? { reason: trimmed } : undefined, {
			onSuccess: () => {
				toast.success(successMessage);
				onOpenChange(false);
			},
			onError: (failure) => setError(mutation.describe(failure)),
		});
	}

	return (
		<div className="flex flex-col gap-6 px-5 py-6 sm:gap-8 sm:px-10 sm:py-8">
			<JobSummary title={job.title} amount={job.priceAmount} asset={job.priceAsset} />

			<div className="flex flex-col gap-2">
				<p className="text-b2 font-medium text-foreground sm:text-b1 sm:font-medium">{question}</p>
				<p className="text-b3 text-neutral-500 sm:text-b1">{detail}</p>
			</div>

			{reason && (
				<div className="flex flex-col gap-2">
					<label htmlFor="action-reason" className="text-b2 font-medium text-foreground sm:text-b1">
						{reason.label}
					</label>
					<Textarea
						id="action-reason"
						value={text}
						onChange={(event) => setText(event.target.value)}
						maxLength={reason.max}
						rows={4}
						placeholder={reason.placeholder}
						className="min-h-28 resize-none"
					/>
					<p className="text-right text-c1 text-neutral-500 tabular-nums">
						{text.trim().length}/{reason.max.toLocaleString("en")}
					</p>
				</div>
			)}

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
	);
}

export { ConfirmJobActionDialog };
