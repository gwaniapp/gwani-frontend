import Image from "next/image";
import Link from "next/link";
import { Logo } from "@repo/ui/logo";
import authBackground from "@repo/ui/assets/images/auth-blue-background.png";
import authHero from "@repo/ui/assets/images/auth-image.svg";
import { AuthBackButton } from "@/features/auth/components/AuthBackButton";

/**
 * Shared shell for every auth screen: below `lg` it's a single column (logo
 * + form); from `lg` up a sticky brand panel takes the left half. The panel
 * never shows on small screens, so its images are never downloaded there —
 * `next/image` is lazy by default and skips `display: none` elements.
 */
function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-primary-100/10 lg:grid lg:grid-cols-2">
			<aside className="sticky top-5 my-5 ml-5 hidden h-[calc(100dvh-2.5rem)] min-h-144 flex-col self-start overflow-hidden rounded-3xl bg-primary-500 text-white lg:flex">
				<Image
					src={authBackground}
					alt=""
					fill
					sizes="50vw"
					className="object-cover"
				/>
				<AuthBackButton className="absolute top-7.5 left-7.5 z-10 size-14" />

				<div className="relative flex min-h-0 flex-1 flex-col gap-8 px-10 pb-10 pt-[clamp(2.5rem,18dvh,14rem)] xl:px-15">
					<div className="flex max-w-xl flex-col gap-4">
						<h2 className="text-h2 font-medium leading-[1.4] xl:text-h1 xl:leading-[1.333]">
							Find skilled people you can trust
						</h2>
						<p className="text-b1 leading-relaxed text-white/90 xl:text-xl xl:leading-normal">
							Gwani connects you with verified service providers through a
							secure, transparent system powered by Stellar.
						</p>
					</div>

					<div className="flex min-h-0 flex-1 items-end justify-center">
						<Image
							src={authHero}
							alt="A smiling verified provider with a 4.8 rating and 32 completed jobs"
							className="h-full max-h-134.5 w-auto"
						/>
					</div>
				</div>
			</aside>

			<div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:min-h-0 lg:px-10 lg:py-5 xl:px-15">
				<div className="mx-auto flex w-full max-w-150 flex-1 flex-col">
					<header className="flex items-center justify-between lg:justify-end">
						<Link href="/" aria-label="Gwani home">
							<Logo size="lg" />
						</Link>
						<AuthBackButton className="size-11 lg:hidden" />
					</header>
					<main className="flex flex-1 flex-col justify-start gap-10 pt-12 pb-10 md:justify-center md:pt-0 lg:justify-start lg:gap-15 lg:pt-[clamp(1.25rem,37dvh-15.5rem,12rem)]">
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}

export { AuthLayout };
