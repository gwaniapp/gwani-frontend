"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CircleCheckBig, CircleDollarSign, Star } from "lucide-react";
import { EmptyState } from "@repo/ui/empty-state";
import { Pagination } from "@repo/ui/pagination";
import { QueryError, ListSkeleton } from "@/components/QueryState";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { NotificationBell, UserAvatar } from "@/features/dashboard/components/HeaderActions";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useGreeting } from "@/features/dashboard/hooks/useGreeting";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { useProviderProfile } from "@/features/provider/hooks/useProviderProfile";
import { ACTIVE_STATUSES, toDashboardJob } from "@/lib/jobs";

const PAGE_SIZE = 4;

/**
 * Provider dashboard overview, on real data: the four headline numbers (from
 * the provider's jobs and profile) and their current jobs (`GET /jobs`). The
 * numbers show "–" until they've loaded. The pager only shows on phones, as in
 * the mock; on desktop "View all" is the way on.
 *
 * - Active Jobs: assigned jobs being worked or paid for.
 * - Completed Jobs: the profile's own `jobs_completed` count.
 * - Pending Payments: jobs marked completed that are waiting for the client to release payment.
 * - Reputation: the profile's score (0–5).
 */
function DashboardOverview() {
	const greeting = useGreeting();
	const { user } = useCurrentUser();
	const jobs = useJobs("provider");
	const profile = useProviderProfile();
	const [page, setPage] = useState(1);

	const all = jobs.data ?? [];
	const active = all.filter((job) => ACTIVE_STATUSES.has(job.status));
	const pageCount = Math.max(1, Math.ceil(active.length / PAGE_SIZE));
	const start = (page - 1) * PAGE_SIZE;
	const visible = active.slice(start, start + PAGE_SIZE);

	const dash = "–";
	const completed = profile.data?.jobs_completed ?? (jobs.data ? all.filter((job) => job.status === "COMPLETED" || job.status === "PAID").length : undefined);
	const reputation = profile.data ? Number(profile.data.reputation) : undefined;

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5 lg:gap-2">
					<h1 className="text-xl font-medium text-foreground lg:text-h4 2xl:text-h3">
						{greeting}
						{user ? `, ${user.first_name}` : ""}
					</h1>
					<p className="text-b3 text-neutral-500 lg:text-b1">
						Here&apos;s what&apos;s happening<span className="hidden lg:inline"> with your service</span> today.
					</p>
				</div>
				<div className="flex items-center gap-3 lg:hidden">
					<NotificationBell className="size-10" />
					<UserAvatar className="size-10" />
				</div>
			</div>

			<section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Active Jobs" value={jobs.data ? String(active.length) : dash} icon={Briefcase} />
				<StatCard label="Completed Jobs" value={completed === undefined ? dash : String(completed)} icon={CircleCheckBig} />
				<StatCard
					label="Pending Payments"
					value={jobs.data ? String(all.filter((job) => job.status === "COMPLETED").length) : dash}
					icon={CircleDollarSign}
				/>
				<StatCard label="Reputation Score" value={reputation === undefined || Number.isNaN(reputation) ? dash : reputation.toFixed(1)} icon={Star} />
			</section>

			<section aria-labelledby="current-jobs" className="flex flex-col gap-5">
				<div className="flex items-end justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h2 id="current-jobs" className="text-xl font-medium text-foreground">
							Current Jobs
						</h2>
						<p className="text-b3 text-neutral-500 lg:text-b1">{jobs.data ? `${active.length} active jobs` : " "}</p>
					</div>
					<Link
						href="/provider/dashboard/jobs"
						className="inline-flex items-center gap-2 text-b3 text-primary-500 outline-none hover:underline focus-visible:underline lg:text-b1 lg:font-normal"
					>
						View all
						<ArrowRight className="size-4 lg:size-5" aria-hidden="true" />
					</Link>
				</div>

				{jobs.isPending ? (
					<ListSkeleton rows={3} />
				) : jobs.isError ? (
					<QueryError message="We couldn't load your jobs." onRetry={() => void jobs.refetch()} />
				) : active.length === 0 ? (
					<EmptyState
						icon={Briefcase}
						title="No active jobs yet"
						description="When a client picks you for a job, it will show up here."
					/>
				) : (
					<>
						<ul className="flex flex-col gap-5">
							{visible.map((job) => (
								<li key={job.id}>
									<JobCard job={toDashboardJob(job)} />
								</li>
							))}
						</ul>

						<div className="flex flex-wrap items-center justify-between gap-3 pt-3 lg:hidden">
							<p className="text-c1 text-neutral-500">
								Showing {visible.length} of {active.length} entries
							</p>
							<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
						</div>
					</>
				)}
			</section>
		</div>
	);
}

export { DashboardOverview };
