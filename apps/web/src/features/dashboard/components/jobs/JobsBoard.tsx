"use client";

import { useRef, useState } from "react";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@repo/ui/empty-state";
import type { JobStatus } from "@repo/ui/job-status-badge";
import { Pagination } from "@repo/ui/pagination";
import { cn } from "@repo/ui/lib/utils";
import { JOB_FILTERS } from "@/lib/jobs";

const PAGE_SIZE = 10;

interface JobsBoardProps<T extends { id: string; status: JobStatus }> {
	title: string;
	jobs: T[];
	renderJob: (job: T) => React.ReactNode;
	/** Sits opposite the title (e.g. "Post a New Job"). */
	action?: React.ReactNode;
	/** While the jobs load, `loadingState` shows instead of the list (the title and tabs stay). */
	loading?: boolean;
	loadingState?: React.ReactNode;
	/** If loading failed, this replaces the list (e.g. a retry message). */
	error?: React.ReactNode;
}

/**
 * The jobs list both roles share: a title (visually hidden on phones, where
 * the mocks start at the tabs), status tabs, the jobs (drawn by the caller),
 * and a pager shown at every size. The tab → status mapping is `JOB_FILTERS`
 * (On Hold = DISPUTED, since the backend has no "on hold").
 */
function JobsBoard<T extends { id: string; status: JobStatus }>({ title, jobs: allJobs, renderJob, action, loading, loadingState, error }: JobsBoardProps<T>) {
	const [filterId, setFilterId] = useState(JOB_FILTERS[0]!.id);
	const [page, setPage] = useState(1);
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

	const filter = JOB_FILTERS.find((f) => f.id === filterId) ?? JOB_FILTERS[0]!;
	const matching = filter.statuses ? allJobs.filter((job) => filter.statuses!.includes(job.status)) : allJobs;
	const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
	const start = (page - 1) * PAGE_SIZE;
	const jobs = matching.slice(start, start + PAGE_SIZE);

	function select(id: string) {
		setFilterId(id);
		setPage(1);
	}

	// Roving tabindex: arrows/Home/End move between tabs, as a tablist should.
	function onTabKeyDown(event: React.KeyboardEvent, index: number) {
		const last = JOB_FILTERS.length - 1;
		const next =
			event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
			: event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
			: event.key === "Home" ? 0
			: event.key === "End" ? last
			: null;
		if (next === null) return;
		event.preventDefault();
		select(JOB_FILTERS[next]!.id);
		tabRefs.current[next]?.focus();
	}

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<div className="flex items-center justify-between gap-4">
				<h1 className="sr-only lg:not-sr-only lg:text-h4 2xl:text-h3 lg:font-medium lg:text-foreground">{title}</h1>
				{action}
			</div>

			<div
				role="tablist"
				aria-label="Filter jobs by status"
				className="hide-scroll flex gap-1 overflow-x-auto rounded-xl border border-primary-100/60 bg-primary-100/20 p-1.5 lg:gap-6 lg:rounded-2xl lg:p-2"
			>
				{JOB_FILTERS.map((item, index) => {
					const active = item.id === filterId;
					return (
						<button
							key={item.id}
							ref={(el) => {
								tabRefs.current[index] = el;
							}}
							type="button"
							role="tab"
							id={`jobs-tab-${item.id}`}
							aria-selected={active}
							aria-controls="jobs-panel"
							tabIndex={active ? 0 : -1}
							onClick={() => select(item.id)}
							onKeyDown={(event) => onTabKeyDown(event, index)}
							className={cn(
								"shrink-0 rounded-lg px-3.5 py-2 text-b3 whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300 max-lg:flex-auto lg:min-w-37.5 lg:px-6 lg:py-3.5 lg:text-b1 lg:font-normal",
								active ? "bg-white text-primary-500 shadow-[0_2px_10px_rgb(0_0_0/0.05)]" : "text-neutral-500 hover:text-foreground",
							)}
						>
							{item.label}
						</button>
					);
				})}
			</div>

			<div id="jobs-panel" role="tabpanel" aria-labelledby={`jobs-tab-${filterId}`} className="flex flex-col gap-5">
				{loading ? (
					loadingState
				) : error ? (
					error
				) : jobs.length === 0 ? (
					<EmptyState icon={Briefcase} title="No jobs here yet" description="Jobs with this status will show up here." />
				) : (
					<ul className="flex flex-col gap-5">
						{jobs.map((job) => (
							<li key={job.id}>{renderJob(job)}</li>
						))}
					</ul>
				)}

				{!loading && !error && matching.length > 0 && (
					<div className="flex flex-wrap items-center justify-between gap-3 pt-3">
						<p className="text-c1 text-neutral-500 lg:text-b3">
							Showing {jobs.length} of {matching.length} entries
						</p>
						<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
					</div>
				)}
			</div>
		</div>
	);
}

export { JobsBoard };
