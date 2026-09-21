"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CircleCheckBig, CircleDollarSign } from "lucide-react";
import { EmptyState } from "@repo/ui/empty-state";
import { ListSkeleton, QueryError } from "@/components/QueryState";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { ClientJobCard } from "@/features/dashboard/components/client/ClientJobCard";
import { QuickActions } from "@/features/dashboard/components/client/QuickActions";
import { NotificationBell, UserAvatar } from "@/features/dashboard/components/HeaderActions";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useGreeting } from "@/features/dashboard/hooks/useGreeting";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { formatAmount } from "@/lib/format";
import { ACTIVE_STATUSES, sumPrices, toDashboardJob } from "@/lib/jobs";

/**
 * Client dashboard overview, on real data (`GET /jobs`): greeting, three
 * headline numbers, quick actions and the jobs under way. Active = a provider
 * is chosen and the job isn't finished; Completed = finished (completed or
 * paid); Total Spent = payments released. "View all" goes to the full list.
 */
function ClientOverview() {
	const greeting = useGreeting();
	const { user } = useCurrentUser();
	const jobs = useJobs("client");

	const all = jobs.data ?? [];
	const active = all.filter((job) => ACTIVE_STATUSES.has(job.status));
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
					<NotificationBell className="size-10" />
					<UserAvatar className="size-10" />
				</div>
			</div>

			<section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				<StatCard label="Active Jobs" value={jobs.data ? String(active.length) : dash} icon={Briefcase} />
				<StatCard
					label="Completed Jobs"
					value={jobs.data ? String(all.filter((job) => job.status === "COMPLETED" || job.status === "PAID").length) : dash}
					icon={CircleCheckBig}
				/>
				<StatCard
					label="Total Spent"
					value={jobs.data ? formatAmount(sumPrices(all, ["PAID"]), all[0]?.price_asset ?? "USDC") : dash}
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
