import Link from "next/link";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { BackHeader } from "@/features/dashboard/components/BackHeader";
import { AboutCard, ProfileIdentity, ReputationCard, SkillsCard } from "@/features/dashboard/components/profile/ProfileParts";
import { WorkHistory } from "@/features/dashboard/components/profile/WorkHistory";
import { Button } from "@repo/ui/button";
import type { ProviderPreview } from "@/lib/mock/providerPreview";

/**
 * A provider as a client sees them before hiring: the same building blocks as
 * the provider's own profile, in the client mock's order — on phones the
 * reputation card comes first, on desktop About and Skills sit above the
 * reputation and wallet pair (the DOM follows the phone order; `lg:order-*`
 * rearranges it). "Hire Provider" goes to the Post a New Job form with this
 * provider preselected. Work history here is the shared `WorkHistory` (label/
 * value cards on phones) — the mobile mock drew these as job cards instead.
 */
function ProviderPreviewView({ provider }: { provider: ProviderPreview }) {
	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<BackHeader href="/client/dashboard/providers" label="Back to providers" />

			<h1 className="sr-only">{provider.name}</h1>
			<ProfileIdentity
				name={provider.name}
				headline={provider.headline}
				location={provider.location}
				rating={provider.rating}
				jobsDone={provider.jobsDone}
				walletVerified={provider.walletVerified}
			/>

			<div className="grid gap-5 lg:grid-cols-2 lg:gap-7.5">
				<ReputationCard
					rating={provider.rating}
					jobsDone={provider.jobsDone}
					completedJobs={provider.jobsDone}
					className="lg:order-3 lg:justify-center lg:rounded-3xl"
				/>
				<AboutCard about={provider.about} />
				<SkillsCard skills={provider.skills} />
				<WalletAddressCard publicKey={provider.walletPublicKey} className="lg:order-4 lg:justify-center" />
			</div>

			<WorkHistory jobs={provider.history} viewAllHref={`/client/dashboard/providers/${provider.id}`} />

			<Button asChild size="giant" className="w-full self-center rounded-lg lg:max-w-150">
				<Link href={`/client/dashboard/jobs/new?provider=${provider.id}`}>Hire Provider</Link>
			</Button>
		</div>
	);
}

export { ProviderPreviewView };
