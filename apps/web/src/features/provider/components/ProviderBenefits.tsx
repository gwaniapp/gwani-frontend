import { Search, ShieldCheck, Star } from "lucide-react";

const BENEFITS = [
	{
		icon: Search,
		title: "Get discovered by clients.",
		description: "Showcase your skills and experience.",
	},
	{
		icon: Star,
		title: "Build your reputation",
		description: "Get rated after completing jobs.",
	},
	{
		icon: ShieldCheck,
		title: "Get paid securely",
		description: "Through our trusted escrow system.",
	},
] as const;

/** Why-register card shown beside the provider registration form on large screens. */
function ProviderBenefits() {
	return (
		<ul className="flex flex-col gap-7.5 rounded-3xl bg-primary-100/30 px-5 py-7.5">
			{BENEFITS.map(({ icon: Icon, title, description }) => (
				<li key={title} className="flex items-center gap-5">
					<span className="flex size-12.5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
						<Icon className="size-5" aria-hidden="true" />
					</span>
					<div className="flex flex-col gap-0.5">
						<span className="text-xl font-medium text-foreground">{title}</span>
						<span className="text-b3 text-foreground">{description}</span>
					</div>
				</li>
			))}
		</ul>
	);
}

export { ProviderBenefits };
