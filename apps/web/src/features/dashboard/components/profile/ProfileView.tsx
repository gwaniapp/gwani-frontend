"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Skeleton } from "@repo/ui/skeleton";
import { QueryError } from "@/components/QueryState";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { AboutCard, ProfileIdentity, ReputationCard, SkillsCard } from "@/features/dashboard/components/profile/ProfileParts";
import { WorkHistory, type WorkHistoryItem } from "@/features/dashboard/components/profile/WorkHistory";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { useProviderProfile } from "@/features/provider/hooks/useProviderProfile";
import { useWallet } from "@/features/provider/hooks/useWallet";
import { providerHeadline, providerLocation } from "@/lib/providers";

/**
 * The provider's own profile, on real data: identity from the account
 * (`GET /users/me`), everything else from `GET /providers/me/profile` (bio,
 * skills, location, reputation, jobs completed), the address from `GET
 * /wallet/me`, and work history from the provider's finished jobs (`GET
 * /jobs`). The backend has no trade title, so the headline is their first skill;
 * a job has no client name, so history shows none. The avatar is initials (a
 * profile photo can be uploaded in Settings, but nothing serves it back yet).
 * A provider with no profile yet is sent to finish registration. The page title
 * is visually hidden on phones, where the mock starts straight at the avatar.
 */
function ProfileView() {
	const { user } = useCurrentUser();
	const profile = useProviderProfile();
	const wallet = useWallet();
	const jobs = useJobs("provider");

	const heading = <h1 className="sr-only lg:not-sr-only lg:text-h4 2xl:text-h3 lg:font-medium lg:text-foreground">Profile</h1>;

	if (profile.isPending) {
		return (
			<div className="flex flex-col gap-6 lg:gap-8" aria-busy="true" aria-label="Loading profile">
				{heading}
				<Skeleton className="h-48 w-full rounded-3xl" />
				<Skeleton className="h-60 w-full rounded-3xl" />
				<Skeleton className="h-40 w-full rounded-3xl" />
			</div>
		);
	}

	if (profile.isError) {
		return (
			<div className="flex flex-col gap-6 lg:gap-8">
				{heading}
				<QueryError message="We couldn't load your profile." onRetry={() => void profile.refetch()} />
			</div>
		);
	}

	const p = profile.data;
	if (!p) {
		return (
			<div className="flex flex-col gap-6 lg:gap-8">
				{heading}
				<EmptyState
					icon={UserRound}
					title="Finish setting up your profile"
					description="Clients find providers through their skills and location. Add yours to start getting jobs."
					action={
						<Button asChild size="medium">
							<Link href="/provider/onboarding">Complete profile</Link>
						</Button>
					}
				/>
			</div>
		);
	}

	const rating = Number(p.reputation) || 0;
	const history: WorkHistoryItem[] = (jobs.data ?? [])
		.filter((job) => job.status === "COMPLETED" || job.status === "PAID")
		.map((job) => ({
			id: job.id,
			title: job.title,
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
					headline={providerHeadline(p)}
					location={providerLocation(p)}
					rating={rating}
					jobsDone={p.jobs_completed}
					walletVerified={Boolean(wallet.data && (wallet.data.type === "linked" || wallet.data.funded))}
				/>
				<ReputationCard rating={rating} jobsDone={p.jobs_completed} completedJobs={p.jobs_completed} className="lg:w-72 lg:shrink-0" />
			</section>

			<div className="grid gap-5 lg:grid-cols-2 lg:gap-7.5">
				<AboutCard about={p.bio ?? ""} />
				<SkillsCard skills={(p.skills ?? []).map((skill) => skill.name)} />
			</div>

			{wallet.isError ? (
				<QueryError message="We couldn't load your wallet address." onRetry={() => void wallet.refetch()} />
			) : (
				<WalletAddressCard publicKey={wallet.data?.public_key ?? ""} ready={Boolean(wallet.data)} />
			)}

			{jobs.isError ? <QueryError message="We couldn't load your work history." onRetry={() => void jobs.refetch()} /> : <WorkHistory jobs={history} viewAllHref="/provider/dashboard/jobs" />}
		</div>
	);
}

export { ProfileView };
