"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Check, Info, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { formatAmount } from "@/lib/format";
import { simulateRequest } from "@/lib/simulation";
import type { JobDetail } from "@/lib/mock/providerJobDetail";

export type CompleteStep = "confirm" | "done";

interface CompleteJobDialogProps {
	job: JobDetail;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	step: CompleteStep;
	onStepChange: (step: CompleteStep) => void;
	/** Called once the (simulated) request succeeds, so the page behind can show the new status. */
	onCompleted: () => void;
}

/**
 * "Mark as Completed" — confirm, then a success step. The request is simulated
 * (mock-first); the real call is `POST /jobs/{id}/complete`, after which the
 * job is COMPLETED and the client is asked to confirm before escrow releases.
 * The parent owns `open`/`step` so it can reset to the confirm step each time
 * the dialog is opened without the content flashing during the close animation.
 */
function CompleteJobDialog({ job, open, onOpenChange, step, onStepChange, onCompleted }: CompleteJobDialogProps) {
	const complete = useMutation({
		mutationFn: () => simulateRequest({ id: job.id }),
		onSuccess: () => {
			onCompleted();
			onStepChange("done");
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl sm:p-0"
				// Only block dismissing while the request is running, so nobody is left guessing whether it went through.
				onInteractOutside={(event) => complete.isPending && event.preventDefault()}
				onEscapeKeyDown={(event) => complete.isPending && event.preventDefault()}
			>
				<DialogHeader className="flex-row items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-10 sm:py-7">
					<div className="flex flex-col gap-1.5">
						<DialogTitle className="text-xl font-medium sm:text-h5 sm:font-medium">Mark Job as Completed</DialogTitle>
						<DialogDescription className="text-b3 sm:text-b2">
							When you&apos;re done with the job, mark it as completed.
						</DialogDescription>
					</div>
					<DialogClose
						aria-label="Close"
						className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-neutral-600 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-200 sm:size-10 sm:rounded-xl"
					>
						<X className="size-5" aria-hidden="true" />
					</DialogClose>
				</DialogHeader>

				{step === "confirm" ? (
					<div className="flex flex-col gap-6 px-5 py-6 sm:gap-8 sm:px-10 sm:py-8">
						<div className="flex items-start justify-between gap-4 rounded-2xl bg-primary-100/30 p-4 sm:rounded-3xl sm:p-6">
							<div className="flex min-w-0 flex-col gap-2 sm:gap-3">
								<p className="truncate text-s1 font-medium text-foreground sm:text-h5 sm:font-medium">{job.title}</p>
								<p className="text-b3 text-neutral-500 sm:text-b1">
									Client: <span className="text-foreground">{job.clientName}</span>
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-1 sm:gap-2">
								<span className="text-b3 text-foreground sm:text-b1">Amount</span>
								<span className="text-s1 font-medium text-foreground sm:text-h5 sm:font-medium">
									{formatAmount(job.priceAmount, job.priceAsset)}
								</span>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<p className="text-b2 font-medium text-foreground sm:text-s1 sm:font-medium">Are you sure this job is complete?</p>
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

						{complete.isError && (
							<p role="alert" className="text-b3 text-danger-600">
								Something went wrong marking the job as completed. Please try again.
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
							<Button
								type="button"
								size="giant"
								className="w-full rounded-lg"
								loading={complete.isPending}
								onClick={() => complete.mutate()}
							>
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
							<h2 className="text-h5 font-medium text-foreground sm:text-4xl">Job Marked as Completed</h2>
							<p className="text-b3 text-neutral-600 sm:text-xl">
								The client has been notified to review your work.
							</p>
						</div>
						<Button asChild size="giant" className="w-full rounded-lg">
							<Link href="/provider/dashboard/jobs">Back to Jobs</Link>
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export { CompleteJobDialog };
