"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { notFound } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { QueryError } from "@/components/QueryState";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { BackHeader } from "@/features/dashboard/components/BackHeader";
import { AboutCard, ProfileIdentity, ReputationCard, SkillsCard } from "@/features/dashboard/components/profile/ProfileParts";
import { WorkHistory } from "@/features/dashboard/components/profile/WorkHistory";
import { useProvider } from "@/features/providers/hooks/useProviders";
import { providerHeadline, providerLocation, providerName } from "@/lib/providers";

/**
 * A provider as a client sees them before hiring (`GET /providers/{id}`): the
 * same building blocks as the provider's own profile — reputation, bio,
 * skills, jobs-completed count, the (public) wallet address and their
 * recent finished jobs (`job_history`, no prices). "Hire Provider" opens Post a New Job with this
 * provider preselected.
 */
function ProviderPreviewView({ id }: { id: string }) {
	const provider = useProvider(id);

	if (provider.isPending) {
		return (
			<div className="flex flex-col gap-6 lg:gap-8" aria-busy="true" aria-label="Loading provider">
				<BackHeader href="/client/dashboard/providers" label="Back to providers" />
				<Skeleton className="h-48 w-full rounded-3xl" />
				<Skeleton className="h-60 w-full rounded-3xl" />
			</div>
		);
	}
	if (provider.isError) {
		if (isAxiosError(provider.error) && (provider.error.response?.status === 404 || provider.error.response?.status === 400)) notFound();
		return (
			<div className="flex flex-col gap-6 lg:gap-8">
				<BackHeader href="/client/dashboard/providers" label="Back to providers" />
				<QueryError message="We couldn't load this provider." onRetry={() => void provider.refetch()} />
			</div>
		);
	}

	const p = provider.data;
	const rating = Number(p.reputation) || 0;

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<BackHeader href="/client/dashboard/providers" label="Back to providers" />

			<h1 className="sr-only">{providerName(p)}</h1>
			<section aria-label="Overview" className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
				<ProfileIdentity
					name={providerName(p)}
					headline={providerHeadline(p)}
					location={providerLocation(p)}
					rating={rating}
						jobsDone={p.jobs_completed}
						avatarUrl={p.avatar_url}
					/>
				<ReputationCard rating={rating} jobsDone={p.jobs_completed} completedJobs={p.jobs_completed} className="lg:w-72 lg:shrink-0" />
			</section>

			<div className="grid gap-5 lg:grid-cols-2 lg:gap-7.5">
				<AboutCard about={p.bio ?? ""} />
				<SkillsCard skills={(p.skills ?? []).map((skill) => skill.name)} />
			</div>

			{p.wallet_address && <WalletAddressCard publicKey={p.wallet_address} />}

			<WorkHistory jobs={p.job_history.map((job) => ({ id: job.id, title: job.title, date: job.date, status: job.status }))} />

			<Button asChild size="giant" className="w-full self-center rounded-lg lg:max-w-150">
				<Link href={`/client/dashboard/jobs/new?provider=${p.id}`}>Hire Provider</Link>
			</Button>
		</div>
	);
}

export { ProviderPreviewView };
