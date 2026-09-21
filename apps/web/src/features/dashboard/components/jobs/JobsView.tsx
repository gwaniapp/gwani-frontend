"use client";

import { ListSkeleton, QueryError } from "@/components/QueryState";
import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobsBoard } from "@/features/dashboard/components/jobs/JobsBoard";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { toDashboardJob } from "@/lib/jobs";

/** The provider's My Jobs page: their assigned jobs (`GET /jobs`) in the shared `JobsBoard`. */
function JobsView() {
	const jobs = useJobs("provider");

	return (
		<JobsBoard
			title="My Jobs"
			jobs={(jobs.data ?? []).map(toDashboardJob)}
			renderJob={(job) => <JobCard job={job} />}
			loading={jobs.isPending}
			loadingState={<ListSkeleton rows={4} />}
			error={jobs.isError ? <QueryError message="We couldn't load your jobs." onRetry={() => void jobs.refetch()} /> : undefined}
		/>
	);
}

export { JobsView };
