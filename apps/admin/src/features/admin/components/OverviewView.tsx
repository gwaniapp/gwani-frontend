"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, ShieldAlert, UserX, Users } from "lucide-react";
import { Skeleton } from "@repo/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { QueryError } from "@/components/QueryState";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { useAdminStats } from "@/features/admin/hooks/useAdminData";
import { statusLabel, volumeEntries } from "@/lib/labels";
import { formatMoney } from "@/lib/format";

const card = "flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgb(0_0_0/0.06)]";

/** Rows with a label, a count and a bar sized against the largest — for "users by role" and "jobs by status". */
function Breakdown({ title, rows }: { title: string; rows: Array<[string, number]> }) {
	const max = Math.max(1, ...rows.map(([, count]) => count));
	return (
		<section className={card} aria-label={title}>
			<h2 className="text-lg font-medium text-foreground">{title}</h2>
			{rows.length === 0 ? (
				<p className="text-b3 text-neutral-500">Nothing yet.</p>
			) : (
				<ul className="flex flex-col gap-3.5">
					{rows.map(([label, count]) => (
						<li key={label} className="flex flex-col gap-1.5">
							<div className="flex items-baseline justify-between gap-3 text-b3 lg:text-b1">
								<span className="text-foreground">{label}</span>
								<span className="font-medium text-foreground tabular-nums">{count.toLocaleString("en")}</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-muted">
								<div className="h-full rounded-full bg-primary-400" style={{ width: `${Math.max(2, (count / max) * 100)}%` }} />
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

/** Money per asset for the two volume cards ("Paid out", "Held in escrow"). */
function Volume({ title, entries }: { title: string; entries: Array<[string, number]> }) {
	return (
		<section className={card} aria-label={title}>
			<h2 className="text-lg font-medium text-foreground">{title}</h2>
			{entries.length === 0 ? (
				<p className="text-h4 text-foreground">0.00</p>
			) : (
				<ul className="flex flex-col gap-1.5">
					{entries.map(([asset, amount]) => (
						<li key={asset} className="text-h4 text-foreground tabular-nums">
							{formatMoney(amount, asset)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function OverviewView() {
	const stats = useAdminStats();

	if (stats.isError) {
		return (
			<div className="flex flex-col gap-6 lg:gap-8">
				<PageHeader title="Overview" />
				<QueryError message="We couldn't load the platform numbers." onRetry={() => void stats.refetch()} />
			</div>
		);
	}

	const data = stats.data;
	const dash = "–";
	const n = (value: number | undefined) => (value === undefined ? dash : value.toLocaleString("en"));

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<PageHeader title="Overview" description="How the platform is doing right now." />

			{data && data.jobs.disputed > 0 && (
				<Link
					href="/disputes"
					className="flex items-center justify-between gap-4 rounded-2xl border border-danger-200 bg-danger-50 px-5 py-4 text-b3 text-danger-700 outline-none transition-colors hover:bg-danger-100/60 focus-visible:ring-2 focus-visible:ring-danger-300 lg:text-b1"
				>
					<span className="flex items-center gap-3">
						<ShieldAlert className="size-5 shrink-0" aria-hidden="true" />
						{data.jobs.disputed === 1 ? "1 job is in dispute and its payment is frozen." : `${data.jobs.disputed} jobs are in dispute and their payments are frozen.`}
					</span>
					<span className="inline-flex shrink-0 items-center gap-2 font-medium">
						Review <ArrowRight className="size-4" aria-hidden="true" />
					</span>
				</Link>
			)}

			<section aria-label="Summary" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard label="Total users" value={n(data?.users.total)} icon={Users} />
				<StatCard label="Suspended users" value={n(data?.users.suspended)} icon={UserX} />
				<StatCard label="Total jobs" value={n(data?.jobs.total)} icon={Briefcase} />
				<StatCard label="Disputed jobs" value={n(data?.jobs.disputed)} icon={ShieldAlert} />
			</section>

			{stats.isPending ? (
				<div className="grid gap-5 lg:grid-cols-2" aria-busy="true" aria-label="Loading">
					<Skeleton className="h-40 rounded-3xl" />
					<Skeleton className="h-40 rounded-3xl" />
					<Skeleton className="h-64 rounded-3xl" />
					<Skeleton className="h-64 rounded-3xl" />
				</div>
			) : (
				data && (
					<>
						<div className="grid gap-5 lg:grid-cols-2">
							<Volume title="Paid out" entries={volumeEntries(data.volume?.paid)} />
							<Volume title="Held in escrow" entries={volumeEntries(data.volume?.locked_in_escrow)} />
						</div>
						<div className="grid gap-5 lg:grid-cols-2">
							<Breakdown title="Users by role" rows={Object.entries(data.users.by_role ?? {}).map(([role, count]) => [statusLabel(role), count])} />
							<Breakdown title="Jobs by status" rows={Object.entries(data.jobs.by_status ?? {}).map(([status, count]) => [statusLabel(status), count])} />
						</div>
					</>
				)
			)}
		</div>
	);
}

export { OverviewView };
