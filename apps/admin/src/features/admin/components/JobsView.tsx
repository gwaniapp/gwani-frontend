"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { TableFrame, Td, Th } from "@/components/DataTable";
import { FilterSelect } from "@/components/Filters";
import { PageHeader } from "@/components/PageHeader";
import { QueryError } from "@/components/QueryState";
import { JobDialog } from "@/features/admin/components/JobDialog";
import { JOBS_PAGE_SIZE, useAdminJobs } from "@/features/admin/hooks/useAdminData";
import { formatDate } from "@/lib/format";
import { priceLabel, shortId, statusLabel } from "@/lib/labels";
import { JOB_STATUSES, type AdminJob } from "@/lib/api/types";

const STATUS_OPTIONS = JOB_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }));

/** Every job on the platform (`GET /admin/jobs`), filtered by status and paged on the server. "Open" shows the job's history, payments and the status override. */
function JobsView() {
	const [status, setStatus] = useState("");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<AdminJob | null>(null);
	const jobs = useAdminJobs({ status, page });

	const total = jobs.data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / JOBS_PAGE_SIZE));
	const rows = jobs.data?.items ?? [];

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<PageHeader title="Jobs" description="Every job on Gwani, whoever posted it." />

			<div className="flex flex-wrap items-end gap-4">
				<FilterSelect
					label="Status"
					value={status}
					onChange={(value) => {
						setStatus(value);
						setPage(1);
					}}
					allLabel="All statuses"
					options={STATUS_OPTIONS}
				/>
			</div>

			<p aria-live="polite" className="-mt-2 text-b3 text-neutral-500">
				{jobs.data ? `${total.toLocaleString("en")} ${total === 1 ? "job" : "jobs"}` : " "}
			</p>

			{jobs.isPending ? (
				<div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading jobs">
					{[0, 1, 2, 3, 4].map((row) => (
						<Skeleton key={row} className="h-14 w-full rounded-xl" />
					))}
				</div>
			) : jobs.isError ? (
				<QueryError message="We couldn't load jobs." onRetry={() => void jobs.refetch()} />
			) : rows.length === 0 ? (
				<EmptyState icon={Briefcase} title="No jobs found" description={status ? "No job has that status." : "No jobs have been posted yet."} />
			) : (
				<div className={jobs.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
					<TableFrame>
						<thead>
							<tr>
								<Th>Job</Th>
								<Th>Status</Th>
								<Th>Amount</Th>
								<Th>Posted</Th>
								<Th className="text-right">
									<span className="sr-only">Actions</span>
								</Th>
							</tr>
						</thead>
						<tbody>
							{rows.map((job) => (
								<tr key={job.id} className="hover:bg-muted/40">
									<Td className="max-w-80">
										<p className="truncate font-medium">{job.title}</p>
										<p className="text-c1 text-neutral-500 lg:text-b3">#{shortId(job.id)}</p>
									</Td>
									<Td>
										<JobStatusBadge status={job.status} className="px-3 py-0.5 text-c1" />
									</Td>
									<Td className="whitespace-nowrap">{priceLabel(job.price_amount, job.price_asset)}</Td>
									<Td className="whitespace-nowrap">{formatDate(job.created_at)}</Td>
									<Td className="text-right">
										<Button type="button" variant="outline" size="medium" onClick={() => setSelected(job)}>
											Open
										</Button>
									</Td>
								</tr>
							))}
						</tbody>
					</TableFrame>
				</div>
			)}

			{rows.length > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-c1 text-neutral-500 lg:text-b3">
						Showing {rows.length} of {total.toLocaleString("en")} entries
					</p>
					<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
				</div>
			)}

			{selected && <JobDialog key={selected.id} job={selected} open onOpenChange={(open) => !open && setSelected(null)} />}
		</div>
	);
}

export { JobsView };
