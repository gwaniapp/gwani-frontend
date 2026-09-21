"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Button } from "@repo/ui/button";
import { JobDialog, JobSummary } from "@/features/dashboard/components/jobs/JobDialogParts";
import { useMarkCompleted } from "@/features/jobs/hooks/useJobs";
import type { DashboardJob } from "@/lib/jobs";

export type CompleteStep = "confirm" | "done";

interface CompleteJobDialogProps {
	job: DashboardJob;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	step: CompleteStep;
	onStepChange: (step: CompleteStep) => void;
}

/**
 * "Mark as Completed" — confirm, then a success step. `POST
 * /jobs/{id}/mark-completed` (IN_PROGRESS → COMPLETED); afterwards the client is
 * asked to confirm and release the escrowed payment. The parent owns
 * `open`/`step` so it can reset to the confirm step each time the dialog is
 * opened without the content flashing during the close animation. A failure
 * (usually "the job isn't in progress any more") shows inside the dialog.
 */
function CompleteJobDialog({ job, open, onOpenChange, step, onStepChange }: CompleteJobDialogProps) {
	const complete = useMarkCompleted(job.id);
	const [error, setError] = useState("");

	function confirm() {
		setError("");
		complete.mutate(undefined, {
			onSuccess: () => onStepChange("done"),
			onError: (failure) => setError(complete.describe(failure)),
		});
	}

	return (
		<JobDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Mark Job as Completed"
			description="When you're done with the job, mark it as completed."
			blockDismiss={complete.isPending}
		>
			{step === "confirm" ? (
				<div className="flex flex-col gap-6 px-5 py-6 sm:gap-8 sm:px-10 sm:py-8">
					<JobSummary title={job.title} amount={job.priceAmount} asset={job.priceAsset} />

					<div className="flex flex-col gap-2">
						<p className="text-b2 font-medium text-foreground sm:text-b1 sm:font-medium">Are you sure this job is complete?</p>
						<p className="text-b3 text-neutral-500 sm:text-b1">
							This will notify the client to review and confirm the work.
							<br />
							You can still make changes if needed.
						</p>
					</div>

					<p className="flex items-center gap-3 rounded-2xl bg-primary-100/30 p-4 text-b3 text-foreground sm:gap-4 sm:rounded-3xl sm:p-6 sm:text-b1">
						<Info className="size-6 shrink-0 text-primary-500" strokeWidth={1.5} aria-hidden="true" />
						Payment will be released once the client confirms completion.
					</p>

					{error && (
						<p role="alert" className="text-b3 text-danger-600">
							{error}
						</p>
					)}

					<div className="flex flex-col-reverse gap-3 pt-2 sm:grid sm:grid-cols-[1fr_1.3fr] sm:gap-4 sm:pt-4">
						<Button
							type="button"
							variant="outline"
							size="giant"
							className="w-full rounded-lg"
							disabled={complete.isPending}
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="button" size="giant" className="w-full rounded-lg" loading={complete.isPending} onClick={confirm}>
							Mark as Completed
							<Check className="size-5" aria-hidden="true" />
						</Button>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center gap-8 px-5 py-8 text-center sm:gap-10 sm:px-20 sm:py-10">
					{/* Same emerald as the wallet-connected screen. */}
					<span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-[#e4f1ec] sm:size-36">
						<span className="flex size-20 items-center justify-center rounded-full bg-[#0a7b4e] sm:size-21">
							<span className="flex size-10 items-center justify-center rounded-full bg-white text-[#0a7b4e]">
								<Check className="size-5" strokeWidth={3} aria-hidden="true" />
							</span>
						</span>
					</span>
					<div className="flex flex-col gap-2 sm:gap-3">
						<h2 className="text-h5 font-medium text-foreground sm:text-h4">Job Marked as Completed</h2>
						<p className="text-b3 text-neutral-600 sm:text-b1">The client has been notified to review your work.</p>
					</div>
					<Button asChild size="giant" className="w-full rounded-lg">
						<Link href="/provider/dashboard/jobs">Back to Jobs</Link>
					</Button>
				</div>
			)}
		</JobDialog>
	);
}

export { CompleteJobDialog };
