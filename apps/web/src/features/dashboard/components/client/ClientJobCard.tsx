import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { formatAmount, formatDate } from "@/lib/format";
import type { DashboardJob } from "@/lib/jobs";

/**
 * One of the client's jobs. A grid so one markup serves both layouts: on phones
 * the title and the "View" button share the top row, with amount, posted date
 * and status stacked underneath; from `md` it's three columns — details, status,
 * and the button. The whole card is the link (the "View" button is part of it,
 * not a second link). The backend's job doesn't carry the provider's name,
 * category or location, so the card shows what it has: title, amount, date, status.
 */
function ClientJobCard({ job }: { job: DashboardJob }) {
	return (
		<Link
			href={`/client/dashboard/jobs/${job.id}`}
			className="group grid gap-y-2 rounded-2xl border border-transparent bg-white p-4 shadow-[0_4px_24px_rgb(0_0_0/0.06)] outline-none transition-colors [grid-template-areas:'title_view'_'amount_amount'_'posted_posted'_'status_status'] grid-cols-[minmax(0,1fr)_auto] hover:border-primary-400 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-200 md:items-center md:gap-x-8 md:gap-y-2 md:rounded-3xl md:px-6 md:py-5 md:[grid-template-areas:'title_status_view'_'amount_status_view'_'posted_status_view'] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]"
		>
			<h3 className="truncate text-b2 font-medium text-foreground [grid-area:title] md:text-s1 md:font-medium">{job.title}</h3>

			<p className="mt-1 text-b2 font-medium text-foreground [grid-area:amount] md:mt-0 md:text-b1 md:font-medium">
				{formatAmount(job.priceAmount, job.priceAsset)}
			</p>
			<p className="text-b3 text-foreground [grid-area:posted] md:text-b1">Posted {formatDate(job.date)}</p>

			<JobStatusBadge
				status={job.status}
				className="mt-1 px-3 py-0.5 text-c2 [grid-area:status] self-start justify-self-start md:mt-0 md:self-center md:px-4 md:py-1 md:text-b3"
			/>

			<span className="inline-flex h-10 items-center justify-center gap-2 self-center rounded-lg border border-primary-500 px-4 text-b3 text-primary-500 transition-colors [grid-area:view] group-hover:bg-primary-100/30 md:h-12 md:px-7 md:text-b1 md:font-normal">
				View
				<ArrowRight className="size-4 md:size-5" aria-hidden="true" />
			</span>
		</Link>
	);
}

export { ClientJobCard };
