"use client";

import { CircleDollarSign, CircleCheckBig } from "lucide-react";
import { Skeleton } from "@repo/ui/skeleton";
import { QueryError } from "@/components/QueryState";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useClientStats } from "@/features/dashboard/hooks/useDashboardStats";
import { ProfileIdentity, StatRow } from "@/features/dashboard/components/profile/ProfileParts";
import { WorkHistory, type WorkHistoryItem } from "@/features/dashboard/components/profile/WorkHistory";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { useProfilePicture } from "@/features/settings/hooks/useAvatar";
import { isWalletSetupIncomplete, useWallet } from "@/features/provider/hooks/useWallet";
import { formatAmount } from "@/lib/format";
import { formatUserLocation } from "@/lib/providers";

/**
 * The client's own profile: identity from the account (`GET /users/me`, including its
 * `location`), the wallet address (`GET /wallet/me`), the client-side stats also shown on the
 * overview (`GET /jobs/client/dashboard/stats` — active/completed/total spent), and a history of
 * paid jobs with the provider's name (`GET /jobs`, via `useJobs("client")`; a job's provider comes
 * along on the dashboard job list). A client has no bio, skills or reputation, so those cards from
 * the provider's profile don't appear here — this is a narrower page by design, not a stand-in.
 */
function ClientProfileView() {
	const { user } = useCurrentUser();
	const stats = useClientStats();
	const wallet = useWallet();
	const picture = useProfilePicture();
	const jobs = useJobs("client");

	const heading = <h1 className="sr-only lg:not-sr-only lg:text-h4 2xl:text-h3 lg:font-medium lg:text-foreground">Profile</h1>;

	const history: WorkHistoryItem[] = (jobs.data ?? [])
		.filter((job) => job.status === "PAID")
		.map((job) => ({
			id: job.id,
			title: job.title,
			counterpartyName: job.provider ? [job.provider.first_name, job.provider.last_name].filter(Boolean).join(" ") : undefined,
			amount: Number(job.price_amount),
			asset: job.price_asset,
			date: job.updated_at ?? job.created_at,
			status: job.status,
		}));

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			{heading}

			<section aria-label="Overview" className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
				<ProfileIdentity
					name={user ? `${user.first_name} ${user.last_name}` : ""}
					location={formatUserLocation(user?.location)}
					avatarUrl={picture.data}
				/>
				{stats.isError ? (
					<QueryError message="We couldn't load your stats." onRetry={() => void stats.refetch()} className="lg:w-72 lg:shrink-0" />
				) : stats.isPending ? (
					<Skeleton className="h-40 w-full rounded-3xl lg:w-72 lg:shrink-0" />
				) : (
					<div className="flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6 lg:w-72 lg:shrink-0 lg:gap-5">
						<StatRow icon={CircleDollarSign} label="Total Spent" value={formatAmount(Number(stats.data?.total_spent ?? 0), "USDC")} />
						<StatRow icon={CircleCheckBig} label="Completed Jobs" value={String(stats.data?.completed_jobs ?? 0)} />
					</div>
				)}
			</section>

			{wallet.isError ? (
				<QueryError message="We couldn't load your wallet address." onRetry={() => void wallet.refetch()} />
			) : (
				<WalletAddressCard publicKey={wallet.data?.public_key ?? ""} ready={Boolean(wallet.data)} verified={wallet.data ? !isWalletSetupIncomplete(wallet.data) : undefined} />
			)}

			{jobs.isError ? (
				<QueryError message="We couldn't load your job history." onRetry={() => void jobs.refetch()} />
			) : (
				<WorkHistory jobs={history} viewAllHref="/client/dashboard/jobs" counterpartyLabel="Provider" />
			)}
		</div>
	);
}

export { ClientProfileView };
