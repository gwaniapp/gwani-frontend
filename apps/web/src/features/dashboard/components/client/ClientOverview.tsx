"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, CircleCheckBig, CircleDollarSign } from "lucide-react";
import { ClientJobCard } from "@/features/dashboard/components/client/ClientJobCard";
import { QuickActions } from "@/features/dashboard/components/client/QuickActions";
import { NotificationBell, UserAvatar } from "@/features/dashboard/components/HeaderActions";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useGreeting } from "@/features/dashboard/hooks/useGreeting";
import { formatAmount } from "@/lib/format";
import { MOCK_CLIENT_JOBS, MOCK_CLIENT_STATS } from "@/lib/mock/clientDashboard";
import { MOCK_PROVIDER } from "@/lib/mock/providerDashboard";

const ACTIVE_STATUSES = new Set(["PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS"]);

/**
 * Client dashboard overview: greeting, three headline numbers, quick actions
 * and the jobs currently under way. Mock data (`lib/mock/clientDashboard.ts`);
 * the signed-in name is the same mock user as the provider side. Only active
 * jobs are listed — "View all" goes to the full list.
 */
function ClientOverview() {
	const greeting = useGreeting();
	const activeJobs = MOCK_CLIENT_JOBS.filter((job) => ACTIVE_STATUSES.has(job.status));

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-col gap-1.5 lg:gap-2">
					<h1 className="text-xl font-medium text-foreground lg:text-h4 2xl:text-h3">
						{greeting}, {MOCK_PROVIDER.firstName} {MOCK_PROVIDER.lastName}
					</h1>
					<p className="text-b3 text-neutral-500 lg:text-b1">Here&apos;s what&apos;s happening with your jobs today.</p>
				</div>
				<div className="flex items-center gap-3 lg:hidden">
					<NotificationBell className="size-10" />
					<UserAvatar className="size-10" />
				</div>
			</div>

			<section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				<StatCard label="Active Jobs" value={String(activeJobs.length)} icon={Briefcase} />
				<StatCard label="Completed Jobs" value={String(MOCK_CLIENT_STATS.completedJobs)} icon={CircleCheckBig} />
				<StatCard
					label="Total Spent"
					value={formatAmount(MOCK_CLIENT_STATS.totalSpent, MOCK_CLIENT_STATS.asset)}
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
						<p className="text-b3 text-neutral-500 lg:text-b1">{activeJobs.length} active jobs</p>
					</div>
					<Link
						href="/client/dashboard/jobs"
						className="inline-flex items-center gap-2 text-b3 text-primary-500 outline-none hover:underline focus-visible:underline lg:text-b1 lg:font-normal"
					>
						View all
						<ArrowRight className="size-4 lg:size-5" aria-hidden="true" />
					</Link>
				</div>

				<ul className="flex flex-col gap-5">
					{activeJobs.map((job) => (
						<li key={job.id}>
							<ClientJobCard job={job} />
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}

export { ClientOverview };
