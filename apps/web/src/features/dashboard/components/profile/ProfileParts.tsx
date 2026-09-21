import { Briefcase, MapPin, Star } from "lucide-react";
import { StarRating } from "@repo/ui/star-rating";
import { cn } from "@repo/ui/lib/utils";
import { initials } from "@/lib/format";

/**
 * The pieces of a provider profile, shared by the provider's own Profile page
 * and the client's provider preview so the two can't drift apart. Layout
 * (which goes where, and in what order) stays with the page.
 */

const CARD = "rounded-3xl bg-white p-5 shadow-[0_4px_24px_rgb(0_0_0/0.06)] lg:min-h-60";

/** Avatar (the profile picture when there is one, else initials), name, trade, location, wallet tag and star rating. */
function ProfileIdentity({
	name,
	headline,
	location,
	rating,
	jobsDone,
	walletVerified,
	avatarUrl,
}: {
	name: string;
	/** What they do — omitted when unknown (the backend has no trade field; the first skill is used). */
	headline?: string;
	location?: string;
	rating: number;
	jobsDone: number;
	walletVerified?: boolean;
	/** The person's own profile picture (only known for the signed-in user; someone else's has no public URL). */
	avatarUrl?: string | null;
}) {
	const [first = "", ...rest] = name.split(" ");

	return (
		<div className="flex items-start gap-4 lg:gap-8">
			<span
				aria-hidden="true"
				style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
				className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary-100 bg-cover bg-center text-h4 text-primary-600 lg:size-45 lg:text-h2 lg:font-semibold"
			>
				{avatarUrl ? null : initials(first, rest.at(-1) ?? "")}
			</span>
			<div className="flex min-w-0 flex-col items-start gap-2 lg:gap-3 lg:pt-3">
				<h2 className="text-xl font-medium text-foreground lg:text-h5">{name}</h2>
				{(headline || location) && (
					<p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-b3 text-foreground lg:text-b1 2xl:text-lg">
						{headline && (
							<span className="inline-flex items-center gap-2">
								<Briefcase className="size-4 lg:size-5" aria-hidden="true" />
								{headline}
							</span>
						)}
						{location && (
							<span className="inline-flex items-center gap-2">
								<MapPin className="size-4 lg:size-5" aria-hidden="true" />
								{location}
							</span>
						)}
					</p>
				)}
				{walletVerified && (
					<span className="rounded-md bg-success-100 px-3 py-1 text-c2 text-[#0a7b4e] lg:text-b3">Verified Wallet</span>
				)}
				<div className="flex items-center gap-3">
					<StarRating value={rating} size="md" />
					<span className="text-c1 text-foreground lg:text-b1">({jobsDone} jobs done)</span>
				</div>
			</div>
		</div>
	);
}

function StatRow({ icon: Icon, label, value, note }: { icon: typeof Star; label: string; value: string; note?: string }) {
	return (
		<div className="flex items-start gap-5">
			<span className="flex size-12.5 shrink-0 items-center justify-center rounded-full bg-white text-neutral-800">
				<Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
			</span>
			<div className="flex flex-col gap-1">
				<p className="text-b3 text-foreground">{label}</p>
				<p className="text-xl font-medium text-foreground">{value}</p>
				{note && <p className="text-b3 text-foreground">{note}</p>}
			</div>
		</div>
	);
}

/** The lavender reputation card: score with the job count under it, then completed jobs. */
function ReputationCard({
	rating,
	jobsDone,
	completedJobs,
	className,
}: {
	rating: number;
	jobsDone: number;
	completedJobs: number;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-6 rounded-3xl bg-primary-100/30 p-6 lg:gap-5", className)}>
			<StatRow icon={Star} label="Reputation Score" value={rating.toFixed(1)} note={`${jobsDone} Completed Jobs`} />
			<StatRow icon={Briefcase} label="Completed Jobs" value={String(completedJobs)} />
		</div>
	);
}

function AboutCard({ about, className }: { about: string; className?: string }) {
	return (
		<section className={cn(CARD, className)}>
			<h2 className="text-xl font-medium text-foreground">About</h2>
			<p className="mt-4 text-b3 leading-relaxed wrap-anywhere whitespace-pre-line text-neutral-500 lg:text-b1">{about || "No bio yet."}</p>
		</section>
	);
}

function SkillsCard({ skills, className }: { skills: string[]; className?: string }) {
	return (
		<section className={cn(CARD, className)}>
			<h2 className="text-xl font-medium text-foreground">Skills &amp; Services</h2>
			{skills.length === 0 && <p className="mt-4 text-b3 text-neutral-500 lg:text-b1">No skills added yet.</p>}
			<ul className="mt-5 flex flex-wrap gap-2.5">
				{skills.map((skill) => (
					<li key={skill} className="rounded-full bg-primary-100/50 px-5 py-1.5 text-c2 text-primary-600">
						{skill}
					</li>
				))}
			</ul>
		</section>
	);
}

export { AboutCard, ProfileIdentity, ReputationCard, SkillsCard };
