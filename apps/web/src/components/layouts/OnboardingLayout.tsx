import Image from "next/image";
import Link from "next/link";
import { Logo } from "@repo/ui/logo";
import authHero from "@repo/ui/assets/images/auth-image.svg";
import { ProviderBenefits } from "@/features/provider/components/ProviderBenefits";

/**
 * Shell for the provider setup screens. Like `AuthLayout` it's one column
 * below `lg` (the page scrolls as normal). From `lg` up it fills the viewport:
 * the logo and the left half (hero + benefits) stay put and only the right
 * column scrolls (see below), with no visible scrollbar. The hero shrinks to fit short windows rather
 * than getting cut off, and never renders on small screens, so its image isn't
 * downloaded there.
 */
function OnboardingLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-primary-100/10 lg:h-dvh lg:overflow-hidden">
			<div className="mx-auto flex min-h-dvh w-full max-w-360 flex-col px-5 py-6 sm:px-10 lg:h-full lg:min-h-0 lg:py-5 lg:pr-15 lg:pl-20">
				<header className="flex shrink-0 lg:justify-end">
					<Link href="/" aria-label="Gwani home">
						<Logo size="lg" />
					</Link>
				</header>

				<div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-2 lg:gap-x-30">
					<aside className="hidden min-h-0 flex-col gap-7 pt-16 pb-5 lg:flex">
						<div className="min-h-0 flex-1">
							<Image
								src={authHero}
								alt="A smiling verified provider with a 4.8 rating and 32 completed jobs"
								className="mx-auto h-full max-h-135 w-auto max-w-full object-contain"
							/>
						</div>
						<ProviderBenefits />
					</aside>

					{/*
					  From `lg` up the column has a fixed height. A screen can put a `shrink-0` heading
					  first and a `min-h-0 flex-1 overflow-y-auto` region second so only that region
					  scrolls (as provider registration does); otherwise the column itself scrolls if its
					  content is taller. Scrollbars are hidden either way.
					*/}
					<div className="lg:min-h-0">
						<main className="hide-scroll mx-auto flex w-full max-w-150 flex-col gap-10 pt-12 pb-10 lg:h-full lg:gap-15 lg:overflow-y-auto lg:pt-[clamp(1.25rem,37dvh-15.5rem,12rem)] lg:pb-5">
							{children}
						</main>
					</div>
				</div>
			</div>
		</div>
	);
}

export { OnboardingLayout };
