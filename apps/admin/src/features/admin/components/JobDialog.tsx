"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { Select } from "@repo/ui/select";
import { Skeleton } from "@repo/ui/skeleton";
import { AdminDialog, Detail } from "@/components/AdminDialog";
import { ConfirmStep } from "@/components/ConfirmStep";
import { IdValue } from "@/components/CopyButton";
import { forceTransitionError, useForceTransition, useJobEscrow, useJobTransitions } from "@/features/admin/hooks/useAdminData";
import { formatDate, formatTime } from "@/lib/format";
import { priceLabel, statusLabel } from "@/lib/labels";
import { JOB_STATUSES, type AdminJob, type JobStatus } from "@/lib/api/types";

const EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx/";

/** The two decisions a dispute usually ends in, as shortcuts. */
const RESOLUTIONS: Array<{ to: JobStatus; label: string; hint: string }> = [
	{ to: "PAID", label: "Release to provider", hint: "Moves the job to Paid: the escrowed amount goes to the provider." },
	{ to: "CANCELLED", label: "Refund the client", hint: "Moves the job to Cancelled: the escrowed amount goes back to the client." },
];

/**
 * One job in full: the details, its status history (a dispute's reason is in the note), its payment
 * records, and the admin override. **The override bypasses the normal rules** — it's how a dispute is
 * settled (DISPUTED → PAID releases to the provider, DISPUTED → CANCELLED refunds the client) — so it
 * always goes through a confirm step, and a note (kept in the audit log and the job's history) is
 * required when the job is disputed.
 */
function JobDialog({ job, open, onOpenChange }: { job: AdminJob; open: boolean; onOpenChange: (open: boolean) => void }) {
	const transitions = useJobTransitions(job.id);
	const escrow = useJobEscrow(job.id);
	const force = useForceTransition(job.id);
	const [target, setTarget] = useState<JobStatus | "">("");
	const [confirming, setConfirming] = useState(false);
	const [error, setError] = useState("");
	const disputed = job.status === "DISPUTED";

	function apply(note: string) {
		if (!target) return;
		setError("");
		force.mutate(
			{ to: target, note: note || undefined },
			{ onSuccess: () => onOpenChange(false), onError: (failure) => setError(forceTransitionError(failure)) },
		);
	}

	return (
		<AdminDialog open={open} onOpenChange={onOpenChange} title={job.title} description={`Job #${job.id.slice(0, 8)}`} blockDismiss={force.isPending}>
			<div className="flex flex-col gap-8">
				<dl className="flex flex-col gap-3.5">
					<Detail label="Status">
						<JobStatusBadge status={job.status} className="px-3 py-0.5 text-c1" />
					</Detail>
					<Detail label="Amount">{priceLabel(job.price_amount, job.price_asset)}</Detail>
					<Detail label="Posted">{formatDate(job.created_at)}</Detail>
					{job.due_date && <Detail label="Due">{formatDate(job.due_date)}</Detail>}
					{job.client_id && (
						<Detail label="Client id">
							<IdValue value={job.client_id} label="Client id" />
						</Detail>
					)}
					{job.provider_id && (
						<Detail label="Provider id">
							<IdValue value={job.provider_id} label="Provider id" />
						</Detail>
					)}
					{job.description && <Detail label="Description">{job.description}</Detail>}
					<Detail label="Job id">
						<IdValue value={job.id} label="Job id" />
					</Detail>
				</dl>

				<section aria-label="Status history" className="flex flex-col gap-3">
					<h3 className="text-b1 font-medium text-foreground">Status history</h3>
					{transitions.isPending ? (
						<Skeleton className="h-16 w-full rounded-xl" />
					) : transitions.isError ? (
						<p className="text-b3 text-danger-600">We couldn&apos;t load the history.</p>
					) : transitions.data.length === 0 ? (
						<p className="text-b3 text-neutral-500">No recorded changes yet.</p>
					) : (
						<ol className="flex flex-col gap-3">
							{transitions.data.map((item, index) => (
								<li key={`${item.created_at}-${index}`} className="flex flex-col gap-1 rounded-xl border border-border p-3.5">
									<div className="flex flex-wrap items-center gap-2 text-b3 text-foreground lg:text-b1">
										{item.from ? <span>{statusLabel(item.from)}</span> : <span className="text-neutral-500">Created</span>}
										<ArrowRight className="size-4 text-neutral-400" aria-hidden="true" />
										<span className="font-medium">{statusLabel(item.to)}</span>
										<span className="ml-auto text-c1 text-neutral-500">
											{formatDate(item.created_at)}, {formatTime(item.created_at)}
										</span>
									</div>
									{item.note && <p className="text-b3 break-words text-neutral-700">“{item.note}”</p>}
								</li>
							))}
						</ol>
					)}
				</section>

				<section aria-label="Payments" className="flex flex-col gap-3">
					<h3 className="text-b1 font-medium text-foreground">Payments</h3>
					{escrow.isPending ? (
						<Skeleton className="h-16 w-full rounded-xl" />
					) : escrow.isError ? (
						<p className="text-b3 text-danger-600">We couldn&apos;t load the payment records.</p>
					) : escrow.data.length === 0 ? (
						<p className="text-b3 text-neutral-500">No on-chain payments for this job.</p>
					) : (
						<ul className="flex flex-col gap-3">
							{escrow.data.map((record) => (
								<li key={record.id} className="flex flex-col gap-1 rounded-xl border border-border p-3.5 text-b3 lg:text-b1">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<span className="font-medium text-foreground">{statusLabel(record.intent ?? record.operation ?? "payment")}</span>
										<span className={record.status.toUpperCase() === "FAILED" ? "text-danger-600" : "text-neutral-600"}>{statusLabel(record.status)}</span>
									</div>
									{record.tx_hash && (
										<a href={`${EXPLORER_TX}${record.tx_hash}`} target="_blank" rel="noreferrer" className="truncate text-c1 text-primary-500 underline underline-offset-4 lg:text-b3">
											{record.tx_hash}
										</a>
									)}
									{record.error && <p className="text-c1 break-words text-danger-600 lg:text-b3">{record.error}</p>}
								</li>
							))}
						</ul>
					)}
				</section>

				<section aria-label="Change status" className="flex flex-col gap-4 rounded-2xl bg-primary-100/30 p-5">
					<div className="flex flex-col gap-1">
						<h3 className="text-b1 font-medium text-foreground">{disputed ? "Resolve this dispute" : "Change status"}</h3>
						<p className="text-b3 text-neutral-600">
							{disputed
								? "The payment is frozen until you decide. This overrides the normal rules and is recorded in the audit log."
								: "An admin override: it bypasses the normal rules and is recorded in the audit log."}
						</p>
					</div>

					{confirming && target ? (
						<ConfirmStep
							title={`Move this job to ${statusLabel(target)}?`}
							description={
								target === "PAID"
									? "The escrowed amount is released to the provider."
									: target === "CANCELLED"
										? "The job is cancelled and the escrowed amount goes back to the client."
										: `The job's status becomes ${statusLabel(target)}, whatever it was before.`
							}
							confirmLabel="Apply"
							destructive={target === "PAID" || target === "CANCELLED"}
							pending={force.isPending}
							error={error}
							note={{ label: "Note for the record", max: 500, required: disputed }}
							onConfirm={apply}
							onBack={() => (setError(""), setConfirming(false))}
						/>
					) : (
						<>
							{disputed && (
								<div className="grid gap-3 sm:grid-cols-2">
									{RESOLUTIONS.map((option) => (
										<button
											key={option.to}
											type="button"
											onClick={() => {
												setTarget(option.to);
												setConfirming(true);
											}}
											className="flex flex-col gap-1 rounded-xl border border-border bg-white p-3.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-300"
										>
											<span className="text-b3 font-medium text-foreground lg:text-b1">{option.label}</span>
											<span className="text-c1 text-neutral-500 lg:text-b3">{option.hint}</span>
										</button>
									))}
								</div>
							)}
							<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
								<label className="flex flex-1 flex-col gap-1.5">
									<span className="text-c1 text-neutral-600">{disputed ? "Or set another status" : "New status"}</span>
									<Select value={target} onChange={(event) => setTarget(event.target.value as JobStatus | "")} className="h-11">
										<option value="">Choose a status</option>
										{JOB_STATUSES.filter((status) => status !== job.status).map((status) => (
											<option key={status} value={status} className="text-foreground">
												{statusLabel(status)}
											</option>
										))}
									</Select>
								</label>
								<Button type="button" size="large" disabled={!target} onClick={() => setConfirming(true)} className="sm:px-8">
									Continue
								</Button>
							</div>
						</>
					)}
				</section>
			</div>
		</AdminDialog>
	);
}

export { JobDialog };
