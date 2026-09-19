import Link from "next/link";
import { Search, ShieldCheck, Star, TriangleAlert } from "lucide-react";
import { Logo } from "@repo/ui/logo";
import { cn } from "@repo/ui/lib/utils";

const VARIANTS = {
	"not-found": {
		icon: Search,
		avatar: "bg-primary-100 text-primary-500",
		title: "Page not found",
		subtitle: "Unverified",
		rating: "0.0",
		footer: "0 completed jobs",
	},
	error: {
		icon: TriangleAlert,
		avatar: "bg-danger-100 text-danger-600",
		title: "Something went wrong",
		subtitle: "On our end",
		rating: null,
		footer: "Released only when you approve",
	},
} as const;

/**
 * The "Verified Provider" card from the auth hero, gone wrong — a not-found
 * page is a provider with no rating and no completed jobs, an error is one
 * with a warning badge. Same card, same voice, so these screens read as part
 * of the product rather than generic system pages.
 */
function StatusIllustration({ variant }: { variant: keyof typeof VARIANTS }) {
	const { icon: Icon, avatar, title, subtitle, rating, footer } = VARIANTS[variant];

	return (
		<div aria-hidden="true" className="relative flex h-56 w-72 items-center justify-center">
			<span className="absolute size-52 rotate-6 rounded-[3rem] bg-primary-100/60" />
			<span className="absolute size-40 -translate-x-16 translate-y-10 -rotate-12 rounded-full bg-primary-200/40" />
			<div className="relative w-64 -rotate-3 animate-float rounded-2xl bg-white p-5 text-left shadow-[0_16px_40px_rgb(50_49_198/0.16)] ring-1 ring-black/5 motion-reduce:animate-none">
				<div className="flex items-center gap-3">
					<span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", avatar)}>
						<Icon className="size-5" />
					</span>
					<div className="flex min-w-0 flex-col">
						<span className="truncate text-b4 font-semibold text-foreground">{title}</span>
						<span className="text-c1 text-muted-foreground">{subtitle}</span>
					</div>
				</div>
				<div className="mt-4 flex items-center gap-1">
					{rating ? (
						<>
							{Array.from({ length: 5 }, (_, i) => (
								<Star key={i} className="size-4 text-neutral-300" />
							))}
							<span className="ml-1.5 text-c2 text-muted-foreground">{rating}</span>
						</>
					) : (
						<span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 text-c2 text-success-800">
							<ShieldCheck className="size-3.5" />
							Escrow protected
						</span>
					)}
				</div>
				<p className="mt-2.5 text-c1 text-muted-foreground">{footer}</p>
			</div>
		</div>
	);
}

interface StatusScreenProps {
	variant: keyof typeof VARIANTS;
	title: string;
	description: string;
	actions: React.ReactNode;
	/** Small print under the actions, e.g. an error reference. */
	footnote?: React.ReactNode;
}

/** Full-page shell for not-found / error: logo, the illustrated card, copy, and actions. */
function StatusScreen({ variant, title, description, actions, footnote }: StatusScreenProps) {
	return (
		<div className="flex min-h-dvh flex-1 flex-col bg-primary-100/10 px-5 py-6 sm:px-10 lg:py-5">
			<header>
				<Link href="/" aria-label="Gwani home" className="inline-block">
					<Logo size="lg" />
				</Link>
			</header>
			<main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
				<StatusIllustration variant={variant} />
				<div className="flex flex-col items-center gap-3">
					<h1 className="text-h4 font-medium text-foreground md:text-h3">{title}</h1>
					<p className="max-w-md text-b3 text-neutral-500 md:text-b1">{description}</p>
				</div>
				<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>
				{footnote && <p className="text-c1 text-muted-foreground">{footnote}</p>}
			</main>
		</div>
	);
}

export { StatusScreen };
