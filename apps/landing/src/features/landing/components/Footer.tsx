import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@repo/ui/logo";
import { appUrl } from "@/lib/appUrl";

/**
 * The Figma export's "Services" footer column was generic template copy
 * (Digital Marketing, SEO, UI Design…) unrelated to gwani's actual
 * categories — replaced here with a few of the real ones from Categories.tsx
 * instead of carrying over placeholder text that doesn't describe this
 * product. "Company"/"Product"/"Legal" links point at pages that don't
 * exist yet (no landing sub-pages are built) — left as `#` rather than 404s.
 */
const COLUMNS = [
	{
		heading: "Company",
		links: [
			{ label: "About us", href: "#about" },
			{ label: "Contact us", href: "#" },
			{ label: "Careers", href: "#" },
			{ label: "Press", href: "#" },
		],
	},
	{
		heading: "Product",
		links: [
			{ label: "Services", href: "#services" },
			{ label: "Who it's for", href: "#who-is-it-for" },
			{ label: "Sign in", href: appUrl("/auth/sign-in") },
			{ label: "Get started", href: appUrl("/auth/sign-up") },
		],
	},
	{
		heading: "Categories",
		links: [
			{ label: "Home & Repairs", href: "#services" },
			{ label: "Cleaning & Outdoor", href: "#services" },
			{ label: "Technology", href: "#services" },
			{ label: "Events & Food", href: "#services" },
		],
	},
	{
		heading: "Legal",
		links: [
			{ label: "Privacy Policy", href: "#" },
			{ label: "Terms & Conditions", href: "#" },
		],
	},
];

const SOCIAL_LINKS = [
	{ label: "Twitter", href: "#", icon: Twitter },
	{ label: "Instagram", href: "#", icon: Instagram },
	{ label: "LinkedIn", href: "#", icon: Linkedin },
	{ label: "Facebook", href: "#", icon: Facebook },
];

function Footer() {
	return (
		<footer className="w-full bg-[#161c2d] py-14 md:py-16 lg:py-20">
			<div className="custom-container flex flex-col gap-12">
				<div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-16">
					<div className="flex flex-col gap-5 lg:w-60 lg:shrink-0">
						<Logo size="sm" className="brightness-0 invert" />
						<p className="max-w-56 text-b3 text-white/60">
							Hire verified professionals. Pay with confidence, held in escrow
							on Stellar.
						</p>
						<div className="flex items-center gap-4">
							{SOCIAL_LINKS.map((social) => (
								<a
									key={social.label}
									href={social.href}
									aria-label={social.label}
									className="text-white/60 transition-colors duration-200 hover:-translate-y-0.5 hover:text-white"
								>
									<social.icon className="size-[18px]" aria-hidden="true" />
								</a>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:flex lg:gap-12 xl:gap-20">
						{COLUMNS.map((column) => (
							<div key={column.heading} className="flex flex-col gap-4 lg:w-32">
								<span className="text-c2 text-white/65 uppercase">{column.heading}</span>
								<nav className="flex flex-col gap-3">
									{column.links.map((link) => (
										<Link
											key={link.label}
											href={link.href}
											className="text-b3 text-white/80 transition-colors duration-200 hover:text-white"
										>
											{link.label}
										</Link>
									))}
								</nav>
							</div>
						))}
					</div>
				</div>

				<div className="flex flex-col items-center gap-2 border-t border-white/10 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
					<p className="text-c1 text-white/50">
						© {new Date().getFullYear()} Gwani. All rights reserved.
					</p>
					<p className="text-c1 text-white/50">Escrow-protected payments on Stellar Testnet.</p>
				</div>
			</div>
		</footer>
	);
}

export { Footer };
