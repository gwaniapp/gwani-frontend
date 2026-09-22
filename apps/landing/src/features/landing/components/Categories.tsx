import Link from "next/link";
import {
	ArrowRight,
	Camera,
	GraduationCap,
	Laptop,
	type LucideIcon,
	Scissors,
	Sparkles,
	Truck,
	UtensilsCrossed,
	Wrench,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { appUrl } from "@/lib/appUrl";

/**
 * Real category groups from apps/web's provider-onboarding catalog
 * (lib/mock/providerOptions.ts) — the backend itself has only a flat skills
 * list, these groupings are the app's own; Figma's per-card instance text
 * wasn't recoverable from the export, so these stand in for it. "Business &
 * Professional" (the 9th group) isn't given its own tile; "View all
 * categories" covers it along with the rest. Per design, the filled-blue
 * look isn't a permanently "featured" card — it's every card's *hover*
 * state, so all cards share one style.
 */
const CATEGORIES: { label: string; icon: LucideIcon }[] = [
	{ label: "Home & Repairs", icon: Wrench },
	{ label: "Cleaning & Outdoor", icon: Sparkles },
	{ label: "Beauty & Wellness", icon: Scissors },
	{ label: "Creative & Media", icon: Camera },
	{ label: "Technology", icon: Laptop },
	{ label: "Events & Food", icon: UtensilsCrossed },
	{ label: "Education & Care", icon: GraduationCap },
	{ label: "Transport & Delivery", icon: Truck },
];

const CARD_CLASS =
	"group flex flex-col gap-5 rounded-xl border border-[#dee8f5] bg-white px-5 py-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary-500 hover:bg-primary-500 hover:shadow-lg hover:shadow-primary-500/20 sm:px-6 sm:py-7";

function Categories() {
	return (
		<section
			id="services"
			className="w-full scroll-mt-20 bg-primary-500/4 py-14 md:scroll-mt-24 md:py-16 lg:scroll-mt-28 lg:py-20"
		>
			<div className="custom-container flex flex-col gap-10 lg:gap-12">
				<Reveal>
					<h2 className="text-h3 text-neutral-800 md:text-h2">Our categories</h2>
				</Reveal>

				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
					{CATEGORIES.map((category, i) => (
						<Reveal key={category.label} delayMs={i * 60} className="h-full">
							<Link href={appUrl("/auth/sign-up?role=client")} className={`${CARD_CLASS} h-full`}>
								<category.icon
									className="size-7 text-primary-500 transition-colors duration-300 group-hover:text-white"
									aria-hidden="true"
								/>
								<div className="flex flex-col gap-1">
									<span className="text-s2 text-neutral-800 transition-colors duration-300 group-hover:text-white">
										{category.label}
									</span>
									<span className="text-b3 text-neutral-500/80 transition-colors duration-300 group-hover:text-white/65">
										Explore services
									</span>
								</div>
							</Link>
						</Reveal>
					))}

					<Reveal delayMs={CATEGORIES.length * 60} className="h-full">
						<Link href={appUrl("/auth/sign-up?role=client")} className={`${CARD_CLASS} h-full`}>
							<ArrowRight
								className="size-7 text-primary-500 transition-colors duration-300 group-hover:text-white"
								aria-hidden="true"
							/>
							<div className="flex flex-col gap-1">
								<span className="text-s2 text-neutral-800 transition-colors duration-300 group-hover:text-white">
									View all categories
								</span>
								<span className="text-b3 text-neutral-500/80 transition-colors duration-300 group-hover:text-white/65">
									Explore services
								</span>
							</div>
						</Link>
					</Reveal>
				</div>
			</div>
		</section>
	);
}

export { Categories };
