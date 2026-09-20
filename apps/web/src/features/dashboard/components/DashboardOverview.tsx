"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CircleCheckBig, CircleDollarSign, Star } from "lucide-react";
import { Pagination } from "@repo/ui/pagination";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { NotificationBell, UserAvatar } from "@/features/dashboard/components/HeaderActions";
import { useGreeting } from "@/features/dashboard/hooks/useGreeting";
import { MOCK_JOBS, MOCK_PROVIDER, MOCK_STATS } from "@/lib/mock/providerDashboard";

const PAGE_SIZE = 4;
const ACTIVE_STATUSES = new Set(["PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS"]);

/**
 * Provider dashboard overview: greeting, the four headline numbers, and the
 * current jobs. Runs on mock data (`lib/mock/providerDashboard.ts`). The pager
 * only shows on phones, as in the mock; on desktop "View all" is the way on.
 */
function DashboardOverview() {
	const greeting = useGreeting();
	const [page, setPage] = useState(1);

	const pageCount = Math.ceil(MOCK_JOBS.length / PAGE_SIZE);
	const start = (page - 1) * PAGE_SIZE;
	const jobs = MOCK_JOBS.slice(start, start + PAGE_SIZE);
	const activeCount = MOCK_JOBS.filter((job) => ACTIVE_STATUSES.has(job.status)).length;

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5 lg:gap-2">
					<h1 className="text-xl font-medium text-foreground lg:text-h4 2xl:text-h3">
						{greeting}, {MOCK_PROVIDER.firstName} {MOCK_PROVIDER.lastName}
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
				<StatCard label="Active Jobs" value={String(MOCK_STATS.activeJobs)} icon={Briefcase} />
				<StatCard label="Completed Jobs" value={String(MOCK_STATS.completedJobs)} icon={CircleCheckBig} />
				<StatCard label="Pending Payments" value={String(MOCK_STATS.pendingPayments)} icon={CircleDollarSign} />
				<StatCard label="Reputation Score" value={MOCK_STATS.reputation.toFixed(1)} icon={Star} />
			</section>

			<section aria-labelledby="current-jobs" className="flex flex-col gap-5">
				<div className="flex items-end justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h2 id="current-jobs" className="text-xl font-medium text-foreground">
							Current Jobs
						</h2>
						<p className="text-b3 text-neutral-500 lg:text-b1">{activeCount} active jobs</p>
					</div>
					<Link
						href="/provider/dashboard/jobs"
						className="inline-flex items-center gap-2 text-b3 text-primary-500 outline-none hover:underline focus-visible:underline lg:text-b1 lg:font-normal"
					>
						View all
						<ArrowRight className="size-4 lg:size-5" aria-hidden="true" />
					</Link>
				</div>

				<ul className="flex flex-col gap-5">
					{jobs.map((job) => (
						<li key={job.id}>
							<JobCard job={job} />
						</li>
					))}
				</ul>

				<div className="flex flex-wrap items-center justify-between gap-3 pt-3 lg:hidden">
					<p className="text-c1 text-neutral-500">
						Showing {jobs.length} of {MOCK_JOBS.length} entries
					</p>
					<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
				</div>
			</section>
		</div>
	);
}

export { DashboardOverview };
