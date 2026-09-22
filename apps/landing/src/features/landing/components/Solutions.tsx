import Link from "next/link";
import { Button } from "@repo/ui/button";
import solutionsImg from "@repo/ui/assets/images/solutions-img.png";
import { Reveal } from "@/components/Reveal";
import { appUrl } from "@/lib/appUrl";

const STEPS = [
	{
		number: "01",
		title: "Find the right provider",
		description:
			"Discover skilled professionals by service and location, then review their reputation and completed jobs.",
	},
	{
		number: "02",
		title: "Know your payment is protected",
		description:
			"Your agreed payment is locked before work begins and stays protected until you confirm completion.",
	},
	{
		number: "03",
		title: "Track every job clearly",
		description:
			"Follow the job from provider selection to payment release with simple status updates.",
	},
];

function Solutions() {
	return (
		<section id="about" className="custom-container scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-28">
			<div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
				<Reveal className="w-full max-w-md lg:order-1 lg:max-w-none lg:flex-1">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={solutionsImg.src}
						alt="A provider working on an HVAC unit, and a provider shaking hands with clients — both photos labelled 'Trusted provider'"
						width={605}
						height={694}
						className="h-auto w-full"
						loading="lazy"
					/>
				</Reveal>

				<Reveal delayMs={150} className="flex w-full flex-col gap-7 lg:order-2 lg:max-w-[534px] lg:gap-[30px]">
					<span className="text-c1 font-bold tracking-[0.1em] text-primary-500 uppercase">
						A better way to get work done
					</span>
					<h2 className="text-h3 text-neutral-800 md:text-h2">
						We have solutions for your problems.
					</h2>
					<div className="flex flex-col gap-6">
						{STEPS.map((step) => (
							<div key={step.number} className="flex gap-4">
								<span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-info-100 text-c2 font-bold text-info-600">
									{step.number}
								</span>
								<div className="flex flex-col gap-1">
									<h3 className="text-s2 text-neutral-800">{step.title}</h3>
									<p className="text-b3 text-neutral-500">{step.description}</p>
								</div>
							</div>
						))}
					</div>
					<Button asChild variant="primary" size="large" className="w-fit">
						<Link href={appUrl("/auth/sign-up")}>Get Started</Link>
					</Button>
				</Reveal>
			</div>
		</section>
	);
}

export { Solutions };
