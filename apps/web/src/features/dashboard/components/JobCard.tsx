import Link from "next/link";
import { ArrowRight, Calendar, CircleDollarSign } from "lucide-react";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { formatAmount, formatDate } from "@/lib/format";
import type { DashboardJob } from "@/lib/jobs";

/**
 * One row of the provider's jobs list. A grid so the same markup can be the
 * phone layout (status top-right, arrow beside the price) and the desktop one
 * (status and arrow centred on the right). Type is deliberately small (16/14/
 * 12px on phones, 18/16/14px from `md`) so a card stays compact. The backend's
 * job has no client name or location, so the meta row is just the posted date.
 */
function JobCard({ job }: { job: DashboardJob }) {
	return (
		<Link
			href={`/provider/dashboard/jobs/${job.id}`}
			className="group grid gap-y-2 rounded-2xl border border-transparent bg-white p-4 shadow-[0_4px_24px_rgb(0_0_0/0.06)] outline-none transition-colors [grid-template-areas:'title_status'_'price_arrow'_'meta_meta'] grid-cols-[minmax(0,1fr)_auto] hover:border-primary-400 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-200 md:items-center md:gap-x-5 md:gap-y-1.5 md:rounded-3xl md:px-6 md:py-5 md:[grid-template-areas:'title_status_arrow'_'price_status_arrow'_'meta_status_arrow'] md:grid-cols-[minmax(0,1fr)_auto_auto]"
		>
			<h3 className="truncate text-b2 text-foreground [grid-area:title] md:text-s1 md:font-medium">{job.title}</h3>

			<JobStatusBadge
				status={job.status}
				className="px-3 py-0.5 text-c2 [grid-area:status] self-start justify-self-end md:self-center md:px-4 md:py-1 md:text-b3"
			/>

			<p className="flex items-center gap-2 text-b3 text-foreground [grid-area:price] md:text-b1">
				<CircleDollarSign className="size-4 shrink-0 text-neutral-500 md:size-5" aria-hidden="true" />
				{formatAmount(job.priceAmount, job.priceAsset)}
			</p>

			<p className="flex items-center gap-1.5 text-c1 text-foreground [grid-area:meta] md:text-b3">
				<Calendar className="size-3.5 shrink-0 text-neutral-500 md:size-4" aria-hidden="true" />
				<span>Posted {formatDate(job.date)}</span>
			</p>

			<ArrowRight
				className="size-4 text-primary-500 transition-transform [grid-area:arrow] self-center justify-self-end group-hover:translate-x-0.5 md:size-5"
				aria-hidden="true"
			/>
		</Link>
	);
}

export { JobCard };
