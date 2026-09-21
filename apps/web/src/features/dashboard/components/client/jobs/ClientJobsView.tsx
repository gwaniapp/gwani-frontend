"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ListSkeleton, QueryError } from "@/components/QueryState";
import { ClientJobCard } from "@/features/dashboard/components/client/ClientJobCard";
import { JobsBoard } from "@/features/dashboard/components/jobs/JobsBoard";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { toDashboardJob } from "@/lib/jobs";

/**
 * The client's My Jobs (`GET /jobs`): the shared `JobsBoard` with the client's
 * job cards and a "Post a New Job" button opposite the title. The mocks only
 * show the title and button on desktop; on phones (no mock) the title stays
 * hidden and the button sits at the top on its own.
 */
function ClientJobsView() {
	const jobs = useJobs("client");

	return (
		<JobsBoard
			title="My Jobs"
			jobs={(jobs.data ?? []).map(toDashboardJob)}
			renderJob={(job) => <ClientJobCard job={job} />}
			loading={jobs.isPending}
			loadingState={<ListSkeleton rows={4} />}
			error={jobs.isError ? <QueryError message="We couldn't load your jobs." onRetry={() => void jobs.refetch()} /> : undefined}
			action={
				<Button asChild size="large" className="max-lg:w-full lg:h-12 lg:px-7 lg:text-b1 lg:font-normal">
					<Link href="/client/dashboard/jobs/new">
						<Plus className="size-4 lg:size-5" aria-hidden="true" />
						Post a New Job
					</Link>
				</Button>
			}
		/>
	);
}

export { ClientJobsView };
