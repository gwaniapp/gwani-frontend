import Link from "next/link";
import { Button } from "@repo/ui/button";
import easyGetServiceImg from "@repo/ui/assets/images/easy-get-service-img.svg";
import { Reveal } from "@/components/Reveal";
import { appUrl } from "@/lib/appUrl";

const STEPS = [
	{
		number: "01",
		title: "Find your provider",
		description: "Browse skilled providers by service and location.",
	},
	{
		number: "02",
		title: "Agree on the job",
		description: "Create a job and agree on the payment.",
	},
	{
		number: "03",
		title: "Lock payment & get it done",
		description: "Secure payment, track the job and release funds when confirmed.",
	},
];

function HowItWorks() {
	return (
		<section className="custom-container">
			<div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
				<Reveal className="w-full max-w-lg lg:max-w-none lg:flex-1">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={easyGetServiceImg.src}
						alt="A search box for finding a provider, a list of matching providers with their reputation, and a 'Payment secured' confirmation"
						width={738}
						height={567}
						className="h-auto w-full"
						loading="lazy"
					/>
				</Reveal>

				<Reveal delayMs={150} className="flex w-full flex-col gap-7 lg:max-w-[534px] lg:gap-[30px]">
					<span className="text-c1 font-bold tracking-[0.1em] text-primary-500 uppercase">
						A better way to get work done
					</span>
					<h2 className="text-h3 text-neutral-800 md:text-h2">
						Easiest way to get a service.
					</h2>
					<p className="text-b1 text-neutral-500">
						Get the help you need without the uncertainty. Gwani keeps the
						journey simple and the payment protected.
					</p>
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

export { HowItWorks };
