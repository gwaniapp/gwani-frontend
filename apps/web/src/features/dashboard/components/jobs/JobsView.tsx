"use client";

import { JobCard } from "@/features/dashboard/components/JobCard";
import { JobsBoard } from "@/features/dashboard/components/jobs/JobsBoard";
import { MOCK_ALL_JOBS } from "@/lib/mock/providerJobs";

/** The provider's My Jobs page (mock data, `lib/mock/providerJobs.ts`) — the shared `JobsBoard` with provider job cards. */
function JobsView() {
	return <JobsBoard title="My Jobs" jobs={MOCK_ALL_JOBS} renderJob={(job) => <JobCard job={job} />} />;
}

export { JobsView };
