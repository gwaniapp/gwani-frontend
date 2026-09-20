import { WalletAddressCard } from "@/components/WalletAddressCard";
import { AboutCard, ProfileIdentity, ReputationCard, SkillsCard } from "@/features/dashboard/components/profile/ProfileParts";
import { WorkHistory } from "@/features/dashboard/components/profile/WorkHistory";
import { MOCK_HISTORY, MOCK_PROFILE } from "@/lib/mock/providerProfile";

/**
 * The provider's own profile: identity and reputation up top, About and Skills
 * side by side, the wallet, then completed work. Mock data
 * (`lib/mock/providerProfile.ts`); the avatar is initials until a photo can be
 * uploaded (`POST /files/request-upload`, purpose `AVATAR`). The page title is
 * visually hidden on phones, where the mock starts straight at the avatar.
 * The pieces are shared with the client's provider preview (`ProfileParts`).
 */
function ProfileView() {
	const p = MOCK_PROFILE;

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<h1 className="sr-only lg:not-sr-only lg:text-h4 2xl:text-h3 lg:font-medium lg:text-foreground">Profile</h1>

			<section aria-label="Overview" className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
				<ProfileIdentity
					name={`${p.firstName} ${p.lastName}`}
					headline={p.headline}
					location={p.location}
					rating={p.rating}
					jobsDone={p.jobsDone}
					walletVerified={p.walletVerified}
				/>
				<ReputationCard
					rating={p.rating}
					jobsDone={p.jobsDone}
					completedJobs={p.completedJobs}
					className="lg:w-72 lg:shrink-0"
				/>
			</section>

			<div className="grid gap-5 lg:grid-cols-2 lg:gap-7.5">
				<AboutCard about={p.about} />
				<SkillsCard skills={p.skills} />
			</div>

			<WalletAddressCard publicKey={p.walletPublicKey} />

			<WorkHistory jobs={MOCK_HISTORY} viewAllHref="/provider/dashboard/jobs" />
		</div>
	);
}

export { ProfileView };
