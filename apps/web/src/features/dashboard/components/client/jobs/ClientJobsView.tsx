"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ClientJobCard } from "@/features/dashboard/components/client/ClientJobCard";
import { JobsBoard } from "@/features/dashboard/components/jobs/JobsBoard";
import { MOCK_ALL_CLIENT_JOBS } from "@/lib/mock/clientDashboard";

/**
 * The client's My Jobs: the shared `JobsBoard` with the client's job cards and
 * a "Post a New Job" button opposite the title. The mocks only show the title
 * and button on desktop; on phones (no mock) the title stays hidden and the
 * button sits at the top on its own.
 */
function ClientJobsView() {
	return (
		<JobsBoard
			title="My Jobs"
			jobs={MOCK_ALL_CLIENT_JOBS}
			renderJob={(job) => <ClientJobCard job={job} />}
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
