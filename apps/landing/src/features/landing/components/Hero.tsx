import Link from "next/link";
import { Button } from "@repo/ui/button";
import heroImg from "@repo/ui/assets/images/hero-img.svg";
import peopleImg from "@repo/ui/assets/images/people.svg";
import { Reveal } from "@/components/Reveal";
import { appUrl } from "@/lib/appUrl";

function Hero() {
	return (
		<section className="bg-primary-800 pt-32 pb-14 md:pt-36 md:pb-16 lg:pt-40 lg:pb-20">
			<div className="custom-container flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
				<Reveal className="flex max-w-xl flex-col items-center gap-6 text-center sm:gap-7 lg:max-w-[620px] lg:items-start lg:gap-[30px] lg:pb-20 lg:text-left">
					<h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-[60px] lg:leading-[1.1]">
						Find skilled people you can trust.
					</h1>
					<p className="max-w-md text-base text-white/70 sm:text-lg lg:max-w-lg">
						Discover trusted service providers, agree on the job, and keep your
						payment protected until the work is complete.
					</p>
					<div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
						<Button asChild variant="primary" size="large" className="bg-white text-primary-800 hover:bg-white/90 active:bg-white/80">
							<Link href={appUrl("/auth/sign-up?role=client")}>Find a provider</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="large"
							className="border-white text-white shadow-sm hover:bg-white/10 hover:text-white"
						>
							<Link href={appUrl("/auth/sign-up?role=provider")}>Offer your services</Link>
						</Button>
					</div>

					{/* The pill (avatars + "12k+") is one self-contained graphic baked
					 * into the exported asset itself — no separate caption to add.
					 * It's placeholder marketing copy: no real user count exists yet
					 * for this 20-day PoC. Re-export the asset with a real figure
					 * (or drop this pill) once there's data to back it. */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={peopleImg.src}
						alt="12k+ professionals on Gwani"
						width={156}
						height={46}
						className="h-11 w-auto sm:h-12"
					/>
				</Reveal>

				<Reveal delayMs={150} className="w-full max-w-[520px] lg:w-[623px] lg:max-w-none">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={heroImg.src}
						alt="A verified plumber at work, with floating cards showing a provider's reputation and escrow-secured payment"
						width={623}
						height={547}
						className="h-auto w-full"
						fetchPriority="high"
					/>
				</Reveal>
			</div>
		</section>
	);
}

export { Hero };
