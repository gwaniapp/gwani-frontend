"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { useState } from "react";
import { notFound } from "next/navigation";
import { Briefcase, CalendarDays, CircleDollarSign, MapPin, Tag, User } from "lucide-react";
import { Button } from "@repo/ui/button";
import { JobStatusBadge, type JobStatus } from "@repo/ui/job-status-badge";
import { Skeleton } from "@repo/ui/skeleton";
import { QueryError } from "@/components/QueryState";
import { CompleteJobDialog, type CompleteStep } from "@/features/dashboard/components/jobs/CompleteJobDialog";
import { ConfirmJobActionDialog } from "@/features/dashboard/components/jobs/ConfirmJobActionDialog";
import { JobTimeline } from "@/features/dashboard/components/jobs/JobTimeline";
import { useDispute, useFundEscrow, useJob, useJobTransitions, useReleaseEscrow } from "@/features/jobs/hooks/useJobs";
import { formatAmount, formatDate } from "@/lib/format";
import { buildTimeline, toDashboardJob } from "@/lib/jobs";
import { formatUserLocation } from "@/lib/providers";

type Role = "provider" | "client";

const NOT_SECURED_PROVIDER = "The client hasn't secured payment yet. You'll be notified once it's locked in escrow.";
const LOCKED_PROVIDER = "The client's payment is locked and will be released when the job is completed and confirmed.";

/** What the payment box tells each side at each stage. */
const PAYMENT_NOTE: Record<Role, Record<JobStatus, string>> = {
	provider: {
		POSTED: NOT_SECURED_PROVIDER,
		PROVIDER_SELECTED: NOT_SECURED_PROVIDER,
		FUNDED: LOCKED_PROVIDER,
		IN_PROGRESS: LOCKED_PROVIDER,
		COMPLETED: "Waiting for the client to confirm the work. Payment is released as soon as they do.",
		PAID: "Payment has been released to your wallet.",
		DISPUTED: "This job is in dispute. The payment stays locked until it's resolved.",
		CANCELLED: "This job was cancelled. Any payment that was locked goes back to the client.",
	},
	client: {
		POSTED: "This job is open. Choose a provider to move it forward.",
		PROVIDER_SELECTED: "Fund the escrow to start the work. Your payment is held safely and only released when you approve the finished job.",
		FUNDED: "Your payment is locked in escrow and will be released when you approve the finished work.",
		IN_PROGRESS: "Your payment is locked in escrow and will be released when you approve the finished work.",
		COMPLETED: "The provider says the work is done. Review it, then release the payment — or raise a dispute if something's wrong.",
		PAID: "Payment has been released to the provider.",
		DISPUTED: "This job is in dispute. The payment stays locked until it's resolved.",
		CANCELLED: "This job was cancelled. Any payment that was locked has been returned to you.",
	},
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1.5">
			<dt className="text-b2 font-medium text-foreground lg:text-b1 lg:font-medium">{label}</dt>
			<dd className="text-b3 text-neutral-500 lg:text-b1">{children}</dd>
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading job">
			<Skeleton className="h-8 w-28 rounded-full" />
			<Skeleton className="h-16 w-full rounded-2xl" />
			<Skeleton className="h-24 w-full rounded-2xl" />
			<div className="grid gap-6 lg:grid-cols-2">
				<Skeleton className="h-72 rounded-3xl" />
				<Skeleton className="h-72 rounded-3xl" />
			</div>
		</div>
	);
}

/**
 * One job, for either side (`role`): status, the path through the flow with real
 * dates from its history, the job's details, a payment note, and the actions the
 * status and role allow —
 *
 * - provider: Mark as Completed (IN_PROGRESS), Raise a dispute (COMPLETED);
 * - client: Fund escrow (PROVIDER_SELECTED), Release payment / Raise a dispute
 *   (COMPLETED), Find a provider (POSTED).
 *
 * The client screens had no design for this page: it reuses the provider's
 * layout. The job detail (`GET /jobs/{id}`) now carries the client's name and
 * the assigned provider's location, shown here as Client / Provider location
 * rows, plus the optional due date and category. Refreshes itself while the job is
 * mid-flight.
 */
function JobDetailView({ id, role }: { id: string; role: Role }) {
	const job = useJob(id);
	const transitions = useJobTransitions(id, job.data?.status);
	const [completeOpen, setCompleteOpen] = useState(false);
	const [completeStep, setCompleteStep] = useState<CompleteStep>("confirm");
	const [fundOpen, setFundOpen] = useState(false);
	const [releaseOpen, setReleaseOpen] = useState(false);
	const [disputeOpen, setDisputeOpen] = useState(false);
	const fund = useFundEscrow(id);
	const release = useReleaseEscrow(id);
	const dispute = useDispute(id);

	if (job.isPending) return <DetailSkeleton />;
	if (job.isError) {
		if (isAxiosError(job.error) && (job.error.response?.status === 404 || job.error.response?.status === 400)) notFound();
		return <QueryError message="We couldn't load this job." onRetry={() => void job.refetch()} />;
	}

	const data = job.data;
	const view = toDashboardJob(data);
	const status = data.status;
	const timeline = buildTimeline(data, transitions.data ?? []);
	const jobsHref = `/${role}/dashboard/jobs`;
	const clientName = data.client ? [data.client.first_name, data.client.last_name].filter(Boolean).join(" ") : "";
	const clientPlace = formatUserLocation(data.client?.location);
	const providerPlace = formatUserLocation(data.location);

	return (
		<div className="flex flex-col gap-8 lg:gap-10">
			<header className="flex flex-col gap-4 lg:gap-5">
				<JobStatusBadge status={status} className="self-start" />
				<div className="flex items-end justify-between gap-4">
					<div className="flex min-w-0 flex-col gap-1">
						<p className="text-b3 text-neutral-600 lg:text-b1 lg:font-normal">Title</p>
						<h1 className="text-xl font-medium text-foreground wrap-anywhere lg:text-h4 2xl:text-h3 lg:font-medium">{data.title}</h1>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-1 text-right">
						<p className="text-b3 text-foreground lg:text-b1 lg:font-normal">{formatDate(data.created_at)}</p>
						<p className="text-xl font-medium text-foreground lg:text-h4 2xl:text-h3 lg:font-medium">{formatAmount(view.priceAmount, view.priceAsset)}</p>
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
						<Field label="Description">
							<span className="leading-relaxed wrap-anywhere whitespace-pre-line">{data.description}</span>
						</Field>
						<Field label="Amount">
							<span className="flex items-center gap-3 text-foreground">
								<CircleDollarSign className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
								{formatAmount(view.priceAmount, view.priceAsset)}
							</span>
						</Field>
						<Field label="Posted">
							<span className="flex items-center gap-3 text-foreground">
								<CalendarDays className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
								{formatDate(data.created_at)}
							</span>
						</Field>
						{data.due_date && (
							<Field label="Due">
								<span className="flex items-center gap-3 text-foreground">
									<CalendarDays className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
									{formatDate(data.due_date)}
								</span>
							</Field>
						)}
						{data.skill_category && (
							<Field label="Category">
								<span className="flex items-center gap-3 text-foreground">
									<Tag className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
									{data.skill_category}
								</span>
							</Field>
						)}
						{role === "provider" && clientName && (
							<Field label="Client">
								<span className="flex items-center gap-3 text-foreground">
									<User className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
									{clientName}
									{clientPlace ? ` · ${clientPlace}` : ""}
								</span>
							</Field>
						)}
						{role === "client" && providerPlace && (
							<Field label="Provider location">
								<span className="flex items-center gap-3 text-foreground">
									<MapPin className="size-5 shrink-0 text-neutral-500" strokeWidth={1.5} aria-hidden="true" />
									{providerPlace}
								</span>
							</Field>
						)}
					</dl>
				</section>

				<div className="flex flex-col gap-6 lg:gap-7">
					<section aria-labelledby="payment-info" className="rounded-3xl bg-primary-100/30 p-6 lg:p-7">
						<h2 id="payment-info" className="text-s1 font-medium text-foreground">
							Payment Information
						</h2>
						<p className="mt-3 max-w-md text-b3 text-foreground">{PAYMENT_NOTE[role][status]}</p>
					</section>

					{role === "provider" && status === "IN_PROGRESS" && (
						<Button
							type="button"
							size="giant"
							className="w-full rounded-lg"
							onClick={() => {
								setCompleteStep("confirm");
								setCompleteOpen(true);
							}}
						>
							Mark as Completed
						</Button>
					)}

					{role === "client" && status === "POSTED" && (
						<Button asChild size="giant" className="w-full rounded-lg">
							<Link href="/client/dashboard/providers">Find a provider</Link>
						</Button>
					)}
					{role === "client" && status === "PROVIDER_SELECTED" && (
						<Button type="button" size="giant" className="w-full rounded-lg" onClick={() => setFundOpen(true)}>
							Fund escrow
						</Button>
					)}
					{role === "client" && status === "COMPLETED" && (
						<Button type="button" size="giant" className="w-full rounded-lg" onClick={() => setReleaseOpen(true)}>
							Release payment
						</Button>
					)}

					{status === "COMPLETED" && (
						<Button
							type="button"
							variant="outline"
							size="giant"
							className="w-full rounded-lg border-danger-300 text-danger-600 hover:bg-danger-50 focus-visible:bg-danger-50"
							onClick={() => setDisputeOpen(true)}
						>
							Raise a dispute
						</Button>
					)}

					<Button asChild variant="ghost" size="large" className="self-start text-primary-500">
						<Link href={jobsHref}>Back to jobs</Link>
					</Button>
				</div>
			</div>

			{role === "provider" && (
				<CompleteJobDialog job={view} open={completeOpen} onOpenChange={setCompleteOpen} step={completeStep} onStepChange={setCompleteStep} />
			)}
			<ConfirmJobActionDialog
				job={view}
				open={fundOpen}
				onOpenChange={setFundOpen}
				title="Fund Escrow"
				description="Lock the payment so the provider can start work."
				question="Lock this payment in escrow?"
				detail="The amount is taken from your Gwani wallet and held safely. It's only released to the provider when you confirm the work is done."
				confirmLabel="Fund escrow"
				successMessage="Escrow funded. The provider can start work."
				mutation={fund}
			/>
			<ConfirmJobActionDialog
				job={view}
				open={releaseOpen}
				onOpenChange={setReleaseOpen}
				title="Release Payment"
				description="Pay the provider for the finished work."
				question="Release the payment to the provider?"
				detail="This sends the escrowed amount to the provider's wallet and can't be undone. If something's wrong, raise a dispute instead."
				confirmLabel="Release payment"
				successMessage="Payment released to the provider."
				mutation={release}
			/>
			<ConfirmJobActionDialog
				job={view}
				open={disputeOpen}
				onOpenChange={setDisputeOpen}
				title="Raise a Dispute"
				description="Hold the payment while the problem is looked at."
				question="Are you sure you want to raise a dispute?"
				detail="The payment stays locked until an admin resolves it. Only do this if you and the other side can't sort it out."
				confirmLabel="Raise dispute"
				successMessage="Dispute raised. The payment is on hold."
				destructive
				mutation={dispute}
			/>
		</div>
	);
}

export { JobDetailView };
