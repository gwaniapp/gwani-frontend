"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Skeleton } from "@repo/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { QueryError } from "@/components/QueryState";
import { JobDialog } from "@/features/admin/components/JobDialog";
import { useAdminDisputes } from "@/features/admin/hooks/useAdminData";
import { formatDate } from "@/lib/format";
import { priceLabel, shortId } from "@/lib/labels";
import type { AdminJob } from "@/lib/api/types";

/**
 * Jobs in dispute (`GET /admin/disputes`): the client or the provider raised a problem and the escrow
 * release is frozen until an admin decides. "Review" opens the job with its history (the reason is in
 * the note) and the two usual outcomes — release to the provider, or refund the client.
 */
function DisputesView() {
	const disputes = useAdminDisputes();
	const [selected, setSelected] = useState<AdminJob | null>(null);

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<PageHeader title="Disputes" description="Jobs whose payment is frozen until an admin decides." />

			{disputes.isPending ? (
				<div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading disputes">
					{[0, 1, 2].map((row) => (
						<Skeleton key={row} className="h-28 w-full rounded-2xl" />
					))}
				</div>
			) : disputes.isError ? (
				<QueryError message="We couldn't load the disputes." onRetry={() => void disputes.refetch()} />
			) : disputes.data.length === 0 ? (
				<EmptyState icon={CircleCheck} title="No open disputes" description="Every payment is moving normally." />
			) : (
				<ul className="flex flex-col gap-4">
					{disputes.data.map((job) => (
						<li key={job.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-danger-100 bg-danger-50/30 p-5">
							<div className="flex min-w-0 flex-col gap-1">
								<p className="truncate text-b1 font-medium text-foreground lg:text-s1">{job.title}</p>
								<p className="text-b3 text-neutral-600 lg:text-b1">
									{priceLabel(job.price_amount, job.price_asset)} · posted {formatDate(job.created_at)} · #{shortId(job.id)}
								</p>
							</div>
							<Button type="button" size="large" onClick={() => setSelected(job)}>
								Review
							</Button>
						</li>
					))}
				</ul>
			)}

			{selected && <JobDialog key={selected.id} job={selected} open onOpenChange={(open) => !open && setSelected(null)} />}
		</div>
	);
}

export { DisputesView };
