"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CircleCheckBig, CircleDollarSign, Star } from "lucide-react";
import { EmptyState } from "@repo/ui/empty-state";
import { Pagination } from "@repo/ui/pagination";
import { QueryError, ListSkeleton } from "@/components/QueryState";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { UserAvatar } from "@/features/dashboard/components/HeaderActions";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useGreeting } from "@/features/dashboard/hooks/useGreeting";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { useProviderStats } from "@/features/dashboard/hooks/useDashboardStats";
import { ACTIVE_STATUSES, toDashboardJob } from "@/lib/jobs";

const PAGE_SIZE = 4;

/**
 * Provider dashboard overview, on real data: the four headline numbers (counted by
 * the server, `GET /providers/provider/dashboard/stats`) and their current jobs
 * (`GET /jobs`). The numbers show "–" until they have loaded (or if there is no profile yet). The pager only shows on phones, as in
 * the mock; on desktop "View all" is the way on.
 *
 * - Active Jobs: assigned jobs being worked or paid for.
 * - Completed Jobs: jobs fully paid out.
 * - Pending Payments: how many jobs are marked completed and waiting for the client to release payment.
 * - Reputation: the provider score (0–5).
 */
function DashboardOverview() {
	const greeting = useGreeting();
	const { user } = useCurrentUser();
	const jobs = useJobs("provider");
	const stats = useProviderStats();
	const [page, setPage] = useState(1);

	const all = jobs.data ?? [];
	const active = all.filter((job) => ACTIVE_STATUSES.has(job.status));
	const pageCount = Math.max(1, Math.ceil(active.length / PAGE_SIZE));
	const start = (page - 1) * PAGE_SIZE;
	const visible = active.slice(start, start + PAGE_SIZE);

	const dash = "–";
	const numbers = stats.data;
	const show = (value: number | undefined) => (value === undefined ? dash : String(value));
	const reputation = numbers ? Number(numbers.reputation_score) : undefined;

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
					<NotificationBell role="provider" className="size-10" />
					<UserAvatar className="size-10" />
				</div>
			</div>

			<section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Active Jobs" value={show(numbers?.active_jobs)} icon={Briefcase} />
				<StatCard label="Completed Jobs" value={show(numbers?.completed_jobs)} icon={CircleCheckBig} />
				<StatCard label="Pending Payments" value={show(numbers?.pending_payments)} icon={CircleDollarSign} />
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
