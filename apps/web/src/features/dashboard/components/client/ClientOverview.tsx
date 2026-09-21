"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CircleCheckBig, CircleDollarSign } from "lucide-react";
import { EmptyState } from "@repo/ui/empty-state";
import { ListSkeleton, QueryError } from "@/components/QueryState";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { ClientJobCard } from "@/features/dashboard/components/client/ClientJobCard";
import { QuickActions } from "@/features/dashboard/components/client/QuickActions";
import { UserAvatar } from "@/features/dashboard/components/HeaderActions";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useGreeting } from "@/features/dashboard/hooks/useGreeting";
import { useClientStats } from "@/features/dashboard/hooks/useDashboardStats";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { formatAmount } from "@/lib/format";
import { toDashboardJob } from "@/lib/jobs";
import type { JobStatus } from "@/lib/api/types";

/** The server's own meaning of "active" for a client: posted and not yet paid out (not disputed or cancelled). */
const CLIENT_ACTIVE: ReadonlySet<JobStatus> = new Set(["POSTED", "PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS", "COMPLETED"]);

/**
 * Client dashboard overview, on real data: greeting, three headline numbers
 * (counted by the server, `GET /jobs/client/dashboard/stats`), quick actions and
 * the jobs under way (`GET /jobs`). Active = posted and not yet paid out (the
 * server definition, so the count and the cards agree); Completed = paid out;
 * Total Spent = payments released. "View all" goes to the full list.
 */
function ClientOverview() {
	const greeting = useGreeting();
	const { user } = useCurrentUser();
	const jobs = useJobs("client");
	const stats = useClientStats();

	const all = jobs.data ?? [];
	const active = all.filter((job) => CLIENT_ACTIVE.has(job.status));
	const dash = "–";

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5 lg:gap-2">
					<h1 className="text-xl font-medium text-foreground lg:text-h4 2xl:text-h3">
						{greeting}
						{user ? `, ${user.first_name}` : ""}
					</h1>
					<p className="text-b3 text-neutral-500 lg:text-b1">Here&apos;s what&apos;s happening with your jobs today.</p>
				</div>
				<div className="flex items-center gap-3 lg:hidden">
					<UserAvatar className="size-10" />
				</div>
			</div>

			<section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				<StatCard label="Active Jobs" value={stats.data ? String(stats.data.active_jobs) : dash} icon={Briefcase} />
				<StatCard label="Completed Jobs" value={stats.data ? String(stats.data.completed_jobs) : dash} icon={CircleCheckBig} />
				<StatCard
					label="Total Spent"
					value={stats.data ? formatAmount(Number(stats.data.total_spent) || 0, all[0]?.price_asset ?? "USDC") : dash}
					icon={CircleDollarSign}
				/>
			</section>

			<QuickActions />

			<section aria-labelledby="active-jobs" className="flex flex-col gap-5">
				<div className="flex items-end justify-between gap-4">
					<div className="flex flex-col gap-1">
						<h2 id="active-jobs" className="text-xl font-medium text-foreground">
							Active Jobs
						</h2>
						<p className="text-b3 text-neutral-500 lg:text-b1">{jobs.data ? `${active.length} active jobs` : " "}</p>
					</div>
					<Link
						href="/client/dashboard/jobs"
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
					<EmptyState icon={Briefcase} title="No active jobs" description="Post a job and choose a provider to get started." />
				) : (
					<ul className="flex flex-col gap-5">
						{active.map((job) => (
							<li key={job.id}>
								<ClientJobCard job={toDashboardJob(job)} />
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}

export { ClientOverview };
