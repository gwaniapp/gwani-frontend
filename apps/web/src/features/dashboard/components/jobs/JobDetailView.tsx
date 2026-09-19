"use client";

import { useState } from "react";
import { Briefcase, CircleDollarSign, MapPin, User } from "lucide-react";
import { Button } from "@repo/ui/button";
import { JobStatusBadge, type JobStatus } from "@repo/ui/job-status-badge";
import { CompleteJobDialog, type CompleteStep } from "@/features/dashboard/components/jobs/CompleteJobDialog";
import { JobTimeline } from "@/features/dashboard/components/jobs/JobTimeline";
import { formatAmount, formatDate } from "@/lib/format";
import { buildTimeline, type JobDetail } from "@/lib/mock/providerJobDetail";

const NOT_SECURED = "The client hasn't secured payment yet. You'll be notified once it's locked in escrow.";
const LOCKED = "The client's payment is locked and will be released when the job is completed and confirmed.";

/** What the payment box tells the provider at each stage. */
const PAYMENT_NOTE: Record<JobStatus, string> = {
	POSTED: NOT_SECURED,
	PROVIDER_SELECTED: NOT_SECURED,
	FUNDED: LOCKED,
	IN_PROGRESS: LOCKED,
	COMPLETED: "Waiting for the client to confirm the work. Payment is released as soon as they do.",
	PAID: "Payment has been released to your wallet.",
	DISPUTED: "This job is in dispute. The payment stays locked until it's resolved.",
	CANCELLED: "This job was cancelled. Any payment that was locked goes back to the client.",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<dt className="text-b2 font-medium text-foreground lg:text-s1 lg:font-medium">{label}</dt>
			<dd className="text-b3 text-neutral-500 lg:text-b1">{children}</dd>
		</div>
	);
}

/**
 * One job, from the provider's side: status, the path through the flow, the
 * job's details, the payment note and the client. When the job is in progress
 * the provider can mark it completed (a confirm → success dialog). Mock data
 * and a simulated request: the new status shows on this page after the dialog
 * but isn't persisted, so a reload goes back to the mock's status.
 */
function JobDetailView({ job }: { job: JobDetail }) {
	const [status, setStatus] = useState<JobStatus>(job.status);
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<CompleteStep>("confirm");

	const timeline = status === job.status ? job.timeline : buildTimeline(status, job.date);

	function openDialog() {
		setStep("confirm");
		setOpen(true);
	}

	return (
		<div className="flex flex-col gap-8 lg:gap-10">
			<header className="flex flex-col gap-4 lg:gap-5">
				<JobStatusBadge status={status} className="self-start" />
				<div className="flex items-end justify-between gap-4">
					<div className="flex min-w-0 flex-col gap-1">
						<p className="text-b3 text-neutral-600 lg:text-s1 lg:font-normal">Title</p>
						<h1 className="text-xl font-medium text-foreground lg:text-h2 lg:font-medium">{job.title}</h1>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-1 text-right">
						<p className="text-b3 text-foreground lg:text-s1 lg:font-normal">{formatDate(job.date)}</p>
						<p className="text-xl font-medium text-foreground lg:text-h2 lg:font-medium">
							{formatAmount(job.priceAmount, job.priceAsset)}
						</p>
					</div>
				</div>
			</header>

			<JobTimeline steps={timeline} />

			<div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-7.5">
				<section aria-labelledby="job-info" className="rounded-3xl bg-white p-5 shadow-[0_4px_24px_rgb(0_0_0/0.06)] lg:p-7">
					<h2 id="job-info" className="flex items-center gap-3 text-s1 font-medium text-foreground">
						<Briefcase className="size-5 text-primary-400" strokeWidth={1.5} aria-hidden="true" />
						Job Information
					</h2>
					<dl className="mt-5 flex flex-col gap-5 lg:mt-6">
						<Field label="Service Category">{job.category}</Field>
						<Field label="Description">
							<span className="leading-relaxed">{job.description}</span>
						</Field>
						<Field label="Location">
							<span className="flex items-center gap-3 text-foreground">
								<MapPin className="size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
								{job.location}
							</span>
						</Field>
						<Field label="Amount">
							<span className="flex items-center gap-3 text-foreground">
								<CircleDollarSign className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
								{formatAmount(job.priceAmount, job.priceAsset)}
							</span>
						</Field>
					</dl>
				</section>

				<div className="flex flex-col gap-6 lg:gap-7">
					<section aria-labelledby="payment-info" className="rounded-3xl bg-primary-100/30 p-6 lg:p-7">
						<h2 id="payment-info" className="text-s1 font-medium text-foreground">
							Payment Information
						</h2>
						<p className="mt-3 max-w-md text-b3 text-foreground">{PAYMENT_NOTE[status]}</p>
					</section>

					{status === "IN_PROGRESS" && (
						<Button type="button" size="giant" className="w-full rounded-lg" onClick={openDialog}>
							Mark as Completed
						</Button>
					)}

					<section aria-labelledby="client" className="flex flex-col gap-4">
						<h2 id="client" className="text-s1 font-medium text-foreground">
							Client
						</h2>
						<div className="flex items-center gap-4">
							<span
								aria-hidden="true"
								className="flex size-15 shrink-0 items-center justify-center rounded-full bg-primary-100/60 text-primary-500"
							>
								<User className="size-7 fill-current" strokeWidth={1.5} />
							</span>
							<div className="flex min-w-0 flex-col">
								<p className="truncate text-s1 font-medium text-foreground">{job.clientName}</p>
								<p className="text-c1 text-foreground">{job.clientLocation}</p>
							</div>
						</div>
					</section>
				</div>
			</div>

			<CompleteJobDialog
				job={{ ...job, status }}
				open={open}
				onOpenChange={setOpen}
				step={step}
				onStepChange={setStep}
				onCompleted={() => setStatus("COMPLETED")}
			/>
		</div>
	);
}

export { JobDetailView };
