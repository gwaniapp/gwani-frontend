import { Briefcase, MapPin, Star } from "lucide-react";
import { StarRating } from "@repo/ui/star-rating";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { WorkHistory } from "@/features/dashboard/components/profile/WorkHistory";
import { initials } from "@/lib/format";
import { MOCK_PROFILE } from "@/lib/mock/providerProfile";

const CARD = "rounded-3xl bg-white p-5 shadow-[0_4px_24px_rgb(0_0_0/0.06)]";

function StatRow({ icon: Icon, label, value, note }: { icon: typeof Star; label: string; value: string; note?: string }) {
	return (
		<div className="flex items-start gap-5">
			<span className="flex size-12.5 shrink-0 items-center justify-center rounded-full bg-white text-neutral-800">
				<Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-b3 text-foreground">{label}</p>
				<p className="text-h5 font-medium text-foreground">{value}</p>
				{note && <p className="text-b3 text-foreground">{note}</p>}
			</div>
		</div>
	);
}

/**
 * The provider's own profile: identity and reputation up top, About and Skills
 * side by side, the wallet, then completed work. Mock data
 * (`lib/mock/providerProfile.ts`); the avatar is initials until a photo can be
 * uploaded (`POST /files/request-upload`, purpose `AVATAR`). The page title is
 * visually hidden on phones, where the mock starts straight at the avatar.
 */
function ProfileView() {
	const p = MOCK_PROFILE;

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<h1 className="sr-only lg:not-sr-only lg:text-h2 lg:font-medium lg:text-foreground">Profile</h1>

			<section aria-label="Overview" className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
				<div className="flex items-start gap-4 lg:gap-8">
					<span
						aria-hidden="true"
						className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary-100 text-h4 text-primary-600 lg:size-45 lg:text-[3.5rem] lg:font-semibold"
					>
						{initials(p.firstName, p.lastName)}
					</span>
					<div className="flex min-w-0 flex-col items-start gap-2 lg:gap-3 lg:pt-3">
						<h2 className="text-xl font-medium text-foreground lg:text-h4">
							{p.firstName} {p.lastName}
						</h2>
						<p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-b3 text-foreground lg:text-xl">
							<span className="inline-flex items-center gap-2">
								<Briefcase className="size-4 lg:size-5" aria-hidden="true" />
								{p.headline}
							</span>
							<span className="inline-flex items-center gap-2">
								<MapPin className="size-4 lg:size-5" aria-hidden="true" />
								{p.location}
							</span>
						</p>
						{p.walletVerified && (
							<span className="rounded-md bg-success-100 px-3 py-1 text-c2 text-[#0a7b4e] lg:text-b3">Verified Wallet</span>
						)}
						<div className="flex items-center gap-3">
							<StarRating value={p.rating} size="md" />
							<span className="text-c1 text-foreground lg:text-b1">({p.jobsDone} jobs done)</span>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6 lg:w-72 lg:shrink-0 lg:gap-5">
					<StatRow icon={Star} label="Reputation Score" value={p.rating.toFixed(1)} note={`${p.jobsDone} Completed Jobs`} />
					<StatRow icon={Briefcase} label="Completed Jobs" value={String(p.completedJobs)} />
				</div>
			</section>

			<div className="grid gap-5 lg:grid-cols-2 lg:gap-7.5">
				<section className={`${CARD} lg:min-h-60`}>
					<h2 className="text-xl font-medium text-foreground">About</h2>
					<p className="mt-4 text-b3 leading-relaxed text-neutral-500 lg:text-b1">{p.about}</p>
				</section>
				<section className={`${CARD} lg:min-h-60`}>
					<h2 className="text-xl font-medium text-foreground">Skills &amp; Services</h2>
					<ul className="mt-5 flex flex-wrap gap-2.5">
						{p.skills.map((skill) => (
							<li key={skill} className="rounded-full bg-primary-100/50 px-5 py-1.5 text-c2 text-primary-600">
								{skill}
							</li>
						))}
					</ul>
				</section>
			</div>

			<WalletAddressCard publicKey={p.walletPublicKey} />

			<WorkHistory />
		</div>
	);
}

export { ProfileView };
