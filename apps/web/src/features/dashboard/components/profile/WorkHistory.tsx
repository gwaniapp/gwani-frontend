"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { Pagination } from "@repo/ui/pagination";
import { formatAmount, formatDate } from "@/lib/format";
import type { JobStatus } from "@repo/ui/job-status-badge";

const PAGE_SIZE = 4;

/** A finished job in a work-history list. The backend's job has no client name, so `clientName` is optional. */
export interface WorkHistoryItem {
	id: string;
	title: string;
	clientName?: string;
	/** Absent on a public provider's history (`job_history` carries no price). */
	amount?: number;
	asset?: string;
	date: string;
	status: JobStatus;
}

/**
 * Completed jobs. On desktop a bordered table-like list (title + client,
 * amount, status, date); on phones each job is a card of label/value rows. The
 * same markup does both — the labels and the phone-only client row are just
 * hidden at `lg`. The pager only shows below `lg`, as in the mocks.
 */
function WorkHistory({ jobs: allJobs, viewAllHref }: { jobs: WorkHistoryItem[]; viewAllHref?: string }) {
	const [page, setPage] = useState(1);

	const pageCount = Math.max(1, Math.ceil(allJobs.length / PAGE_SIZE));
	const start = (page - 1) * PAGE_SIZE;
	const jobs = allJobs.slice(start, start + PAGE_SIZE);

	return (
		<section aria-labelledby="work-history" className="flex flex-col gap-5">
			<div className="flex items-end justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h2 id="work-history" className="text-xl font-medium text-foreground">
						Work History
					</h2>
					<p className="text-b3 text-neutral-500 lg:text-b1">{allJobs.length} completed {allJobs.length === 1 ? "job" : "jobs"}</p>
				</div>
				{viewAllHref && (
					<Link
						href={viewAllHref}
						className="inline-flex items-center gap-2 text-b3 text-primary-500 outline-none hover:underline focus-visible:underline lg:text-b1 lg:font-normal"
					>
						View all
						<ArrowRight className="size-4 lg:size-5" aria-hidden="true" />
					</Link>
				)}
			</div>

			{allJobs.length === 0 && <p className="text-b3 text-neutral-500 lg:text-b1">Finished jobs will show up here.</p>}
			<ul className="flex flex-col gap-4 lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border">
				{jobs.map((job) => (
					<li
						key={job.id}
						className="rounded-2xl border border-border bg-white p-5 lg:rounded-none lg:border-0 lg:border-b lg:p-0 lg:last:border-b-0"
					>
						<div className="grid gap-3.5 text-b3 lg:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1fr] lg:items-center lg:gap-4 lg:px-5 lg:py-4 lg:text-b1">
							<div className="flex items-baseline justify-between gap-4 lg:block lg:min-w-0">
								<span className="text-foreground lg:hidden">Title</span>
								<div className="min-w-0 text-right lg:text-left">
									<p className="truncate font-medium text-foreground lg:text-s2">{job.title}</p>
									{job.clientName && <p className="hidden truncate text-b3 text-neutral-500 lg:block">Client: {job.clientName}</p>}
								</div>
							</div>

							<div className="flex items-baseline justify-between gap-4">
								<span className="text-foreground lg:hidden">Amount</span>
								<span className="text-foreground">
									{job.amount === undefined ? (
										"—"
									) : (
										<>
											<span className="lg:hidden">+ </span>
											{formatAmount(job.amount, job.asset ?? "USDC")}
										</>
									)}
								</span>
							</div>

							{job.clientName && (
								<div className="flex items-baseline justify-between gap-4 lg:hidden">
									<span className="text-foreground">Client</span>
									<span className="text-foreground">{job.clientName}</span>
								</div>
							)}

							<div className="flex items-center justify-between gap-4">
								<span className="text-foreground lg:hidden">Status</span>
								<JobStatusBadge status={job.status} className="px-3 py-0.5 text-c2 lg:px-4 lg:py-1 lg:text-b3" />
							</div>

							<div className="flex items-baseline justify-between gap-4 lg:justify-end">
								<span className="text-foreground lg:hidden">Date</span>
								<span className="text-foreground">{formatDate(job.date)}</span>
							</div>
						</div>
					</li>
				))}
			</ul>

			<div className="flex flex-wrap items-center justify-between gap-3 pt-3 lg:hidden">
				<p className="text-c1 text-neutral-500">
					Showing {jobs.length} of {allJobs.length} entries
				</p>
				<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
			</div>
		</section>
	);
}

export { WorkHistory };
