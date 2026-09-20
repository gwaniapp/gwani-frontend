import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Star } from "lucide-react";
import { Button } from "@repo/ui/button";
import type { DiscoverableProvider } from "@/lib/mock/providers";

function initialsOf(name: string) {
	return name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/**
 * A provider in the results grid. The photo in the mock isn't available as an
 * asset, so the avatar is initials (real ones would come from the provider's
 * avatar file). "View profile" is the only link — the client-side provider
 * profile isn't designed/built yet, so it 404s for now.
 */
function ProviderCard({ provider }: { provider: DiscoverableProvider }) {
	return (
		<article className="flex h-full w-full flex-col justify-between gap-5 rounded-3xl bg-white p-5 shadow-[0_4px_24px_rgb(0_0_0/0.06)] lg:gap-6">
			<div className="flex items-center gap-4 lg:gap-5">
				<span
					aria-hidden="true"
					className="flex size-18 shrink-0 items-center justify-center rounded-full bg-primary-100 text-h5 text-primary-600 lg:size-20"
				>
					{initialsOf(provider.name)}
				</span>
				<div className="flex min-w-0 flex-col gap-1.5">
					<h3 className="truncate text-xl font-medium text-foreground lg:text-xl">{provider.name}</h3>
					<ul className="flex flex-col gap-1 text-b3 text-foreground lg:text-b1">
						<li className="flex items-center gap-2.5">
							<Briefcase className="size-4 shrink-0 text-neutral-600 lg:size-5" strokeWidth={1.5} aria-hidden="true" />
							<span className="truncate">{provider.headline}</span>
						</li>
						<li className="flex items-center gap-2.5">
							<Star className="size-4 shrink-0 fill-warning-300 text-neutral-800 lg:size-5" strokeWidth={1.5} aria-hidden="true" />
							<span>
								<span className="text-neutral-500">
									<span className="sr-only">Rated </span>
									{provider.rating.toFixed(1)}
								</span>
								<span className="ml-2.5">({provider.jobsCompleted} jobs)</span>
							</span>
						</li>
						<li className="flex items-start gap-2.5">
							<MapPin className="mt-0.5 size-4 shrink-0 text-neutral-600 lg:size-5" strokeWidth={1.5} aria-hidden="true" />
							<span>{provider.location}</span>
						</li>
					</ul>
				</div>
			</div>

			<Button
				asChild
				variant="outline"
				size="large"
				className="w-full border-primary-500 text-primary-500 hover:bg-primary-100/30 focus-visible:bg-primary-100/30 lg:h-12 lg:text-b1 lg:font-normal"
			>
				<Link href={`/client/dashboard/providers/${provider.id}`}>
					View profile
					<ArrowRight className="size-4 lg:size-5" aria-hidden="true" />
				</Link>
			</Button>
		</article>
	);
}

export { ProviderCard };
