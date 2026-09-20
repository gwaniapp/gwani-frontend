import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, UserRound } from "lucide-react";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { formatAmount, formatDate } from "@/lib/format";
import type { ClientJob } from "@/lib/mock/clientDashboard";

/**
 * One of the client's jobs. A grid so one markup serves both layouts: on
 * phones the title, provider and category/location stack with the "View"
 * button beside them, then amount, posted date and status underneath; from
 * `md` it's three columns — details, status + amount + date, and the button.
 * The whole card is the link (the "View" button is part of it, not a second
 * link).
 */
function ClientJobCard({ job }: { job: ClientJob }) {
	return (
		<Link
			href={`/client/dashboard/jobs/${job.id}`}
			className="group grid gap-y-2 rounded-2xl border border-transparent bg-white p-4 shadow-[0_4px_24px_rgb(0_0_0/0.06)] outline-none transition-colors [grid-template-areas:'title_view'_'provider_view'_'meta_view'_'amount_amount'_'posted_posted'_'status_status'] [grid-template-columns:minmax(0,1fr)_auto] hover:border-primary-400 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-200 md:items-center md:gap-x-8 md:gap-y-2 md:rounded-3xl md:px-6 md:py-5 md:[grid-template-areas:'title_status_view'_'provider_amount_view'_'meta_posted_view'] md:[grid-template-columns:minmax(0,1.3fr)_minmax(0,1fr)_auto]"
		>
			<h3 className="truncate text-b2 font-medium text-foreground [grid-area:title] md:text-s1 md:font-medium">{job.title}</h3>

			<p className="flex items-center gap-2 text-b3 text-foreground [grid-area:provider] md:text-b1">
				<UserRound className="size-4 shrink-0 text-neutral-600 md:size-5" aria-hidden="true" />
				<span className="truncate">{job.providerName}</span>
			</p>

			<ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-c1 text-foreground [grid-area:meta] md:gap-x-5 md:text-b3">
				<li className="flex min-w-0 items-center gap-1.5">
					<Briefcase className="size-3.5 shrink-0 text-neutral-600 md:size-4" aria-hidden="true" />
					<span className="truncate">{job.category}</span>
				</li>
				<li className="flex min-w-0 items-center gap-1.5">
					<MapPin className="size-3.5 shrink-0 text-neutral-600 md:size-4" aria-hidden="true" />
					<span className="truncate">{job.location}</span>
				</li>
			</ul>

			<p className="mt-1 text-b2 font-medium text-foreground [grid-area:amount] md:mt-0 md:text-s1 md:font-medium">
				{formatAmount(job.priceAmount, job.priceAsset)}
			</p>
			<p className="text-b3 text-foreground [grid-area:posted] md:text-b1">Posted {formatDate(job.postedDate)}</p>

			<JobStatusBadge
				status={job.status}
				className="mt-1 px-3 py-0.5 text-c2 [grid-area:status] self-start justify-self-start md:mt-0 md:self-center md:px-4 md:py-1 md:text-b3"
			/>

			<span className="inline-flex h-10 items-center justify-center gap-2 self-center rounded-lg border border-primary-500 px-4 text-b3 text-primary-500 transition-colors [grid-area:view] group-hover:bg-primary-100/30 md:h-15 md:px-7 md:text-s1 md:font-normal">
				View
				<ArrowRight className="size-4 md:size-5" aria-hidden="true" />
			</span>
		</Link>
	);
}

export { ClientJobCard };
