import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";
import { Button } from "@repo/ui/button";
import reliablePaymentImg from "@repo/ui/assets/images/reliable-payment-img.svg";
import reliableCustomersImg from "@repo/ui/assets/images/reliable-customers-img.svg";
import { Reveal } from "@/components/Reveal";
import { appUrl } from "@/lib/appUrl";

const CLIENT_POINTS = [
	{ title: "Find skilled providers", description: "Browse profiles, skills and completed jobs." },
	{ title: "Agree on the job", description: "Set the service details and agreed payment." },
	{ title: "Pay securely", description: "Funds stay protected until you confirm completion." },
];

const PROVIDER_POINTS = [
	{ title: "Show your skills", description: "Create a wallet-linked provider profile." },
	{ title: "Get hired", description: "Connect with clients and take on jobs." },
	{ title: "Get paid", description: "Receive the agreed payment after completion." },
];

/**
 * Each audience card is its own full-width section (like Solutions/
 * HowItWorks), not a 2-column split — confirmed against the Figma export,
 * which shows each one filling the full canvas on its own. That also
 * removes the earlier cramped-column overflow bug for good: the image
 * column stays flexible (`flex-1`) and the text column is capped
 * (`max-w-[534px]`), the same safe pattern the other sections use.
 */
function AudienceCta() {
	return (
		<>
			<section
				id="who-is-it-for"
				className="w-full scroll-mt-20 bg-primary-500/4 py-14 md:scroll-mt-24 md:py-16 lg:scroll-mt-28 lg:py-20"
			>
				<div className="custom-container flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
					<Reveal className="w-full max-w-sm lg:max-w-none lg:flex-1">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={reliablePaymentImg.src}
							alt="A provider at work, with a floating card showing their reputation and a 'Payment protected' badge"
							width={471}
							height={511}
							className="h-auto w-full max-w-[420px] lg:max-w-none"
							loading="lazy"
						/>
					</Reveal>

					<Reveal delayMs={150} className="flex w-full flex-col gap-7 lg:max-w-[534px] lg:gap-[30px]">
						<span className="text-c1 font-bold tracking-[0.13em] text-primary-500 uppercase">
							For clients
						</span>
						<h2 className="text-h3 text-neutral-800 md:text-h2">
							Get reliable work with secure payments.
						</h2>
						<p className="text-b1 text-neutral-500">
							Find skilled service providers for your needs, agree on the job,
							and keep your payment protected until the work is complete.
						</p>
						<ul className="flex flex-col gap-4">
							{CLIENT_POINTS.map((point) => (
								<li key={point.title} className="flex gap-4">
									<span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-info-100 text-info-600">
										<Sparkle className="size-4" fill="currentColor" aria-hidden="true" />
									</span>
									<div className="flex flex-col gap-1">
										<span className="text-s2 text-neutral-800">{point.title}</span>
										<span className="text-b3 text-neutral-500">{point.description}</span>
									</div>
								</li>
							))}
						</ul>
						<Button asChild variant="primary" size="large" className="w-fit">
							<Link href={appUrl("/auth/sign-up?role=client")}>
								Become a client
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
						</Button>
					</Reveal>
				</div>
			</section>

			<section className="w-full bg-primary-800 py-14 md:py-16 lg:py-20">
				<div className="custom-container flex flex-col items-center gap-12 lg:flex-row-reverse lg:items-center lg:gap-16">
					<Reveal className="w-full max-w-sm lg:max-w-none lg:flex-1">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={reliableCustomersImg.src}
							alt="A provider at work, with a floating card showing their reputation and a 'Payment released' badge"
							width={471}
							height={513}
							className="h-auto w-full max-w-[420px] lg:max-w-none"
							loading="lazy"
						/>
					</Reveal>

					<Reveal delayMs={150} className="flex w-full flex-col gap-7 lg:max-w-[534px] lg:gap-[30px]">
						<span className="text-c1 font-bold tracking-[0.13em] text-primary-300 uppercase">
							For providers
						</span>
						<h2 className="text-h3 text-white md:text-h2">
							Earn more from reliable customers.
						</h2>
						<p className="text-b1 text-primary-100/90">
							Showcase your skills, connect with clients who need your
							service, and receive payment when the job is completed.
						</p>
						<ul className="flex flex-col gap-4">
							{PROVIDER_POINTS.map((point) => (
								<li key={point.title} className="flex gap-4">
									<span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white/10 text-primary-200">
										<Sparkle className="size-4" fill="currentColor" aria-hidden="true" />
									</span>
									<div className="flex flex-col gap-1">
										<span className="text-s2 text-white">{point.title}</span>
										<span className="text-b3 text-primary-100/80">{point.description}</span>
									</div>
								</li>
							))}
						</ul>
						<Button
							asChild
							variant="primary"
							size="large"
							className="w-fit bg-white text-primary-600 hover:bg-white/90 active:bg-white/80"
						>
							<Link href={appUrl("/auth/sign-up?role=provider")}>
								Become a service provider
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
						</Button>
					</Reveal>
				</div>
			</section>
		</>
	);
}

export { AudienceCta };
