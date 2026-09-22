"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Logo } from "@repo/ui/logo";
import { appUrl } from "@/lib/appUrl";

const NAV_LINKS = [
	{ href: "#home", label: "Home" },
	{ href: "#about", label: "About" },
	{ href: "#services", label: "Services" },
	{ href: "#who-is-it-for", label: "Who is it for" },
];

function Navbar() {
	const [open, setOpen] = useState(false);

	// "#home" targets the fixed header itself, whose scroll-into-view
	// behavior for a hash jump is undefined across browsers (fixed elements
	// aren't part of normal document flow) — so it's scrolled to explicitly
	// instead of left to the native anchor jump, which every other link uses.
	const handleNavClick = (href: string) => (e: React.MouseEvent) => {
		setOpen(false);
		if (href === "#home") {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<>
			<header
				id="home"
				className="fixed inset-x-0 top-0 z-50 h-16 border-b border-black/5 bg-white/95 backdrop-blur-sm md:h-20 lg:h-22"
			>
				<div className="custom-container flex h-full items-center justify-between">
					<a href="#home" aria-label="Gwani home" className="shrink-0">
						<Logo size="sm" className="md:h-8" />
					</a>

					<nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
						{NAV_LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={handleNavClick(link.href)}
								className="text-b1 text-neutral-500 transition-colors duration-200 hover:text-foreground"
							>
								{link.label}
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-3 lg:flex">
						<Button
							asChild
							variant="outline"
							size="medium"
							className="border-primary-500 text-primary-500 transition-colors duration-200 hover:bg-primary-500/5"
						>
							<Link href={appUrl("/auth/sign-in")}>Sign in</Link>
						</Button>
						<Button asChild variant="primary" size="medium">
							<Link href={appUrl("/auth/sign-up")}>Get Started</Link>
						</Button>
					</div>

					<button
						type="button"
						onClick={() => setOpen(true)}
						className="tap-target -mr-2 inline-flex items-center justify-center rounded-lg text-foreground lg:hidden"
						aria-label="Open menu"
						aria-expanded={open}
					>
						<Menu className="size-6" aria-hidden="true" />
					</button>
				</div>
			</header>

			{/* Mobile / tablet slide-in menu. Rendered as a SIBLING of <header>, not
			 * a child: <header> has backdrop-blur-sm, and backdrop-filter on an
			 * ancestor makes it the containing block for `position: fixed`
			 * descendants (a well-known CSS gotcha) — nested inside <header> this
			 * panel was being confined to header's own ~64px height instead of the
			 * full viewport, so it only ever covered a sliver at the top and the
			 * page showed through underneath. A plain state-toggled panel (no
			 * drawer primitive pulled in) since this is the only place apps/landing
			 * needs one and it doesn't need drag-to-dismiss. */}
			<div
				className={`fixed inset-0 z-50 transition-opacity duration-200 lg:hidden ${
					open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
				}`}
			>
				<div
					className="absolute inset-0 bg-black/40"
					onClick={() => setOpen(false)}
					aria-hidden="true"
				/>
				<div
					className={`absolute inset-y-0 right-0 flex w-[min(320px,85vw)] flex-col gap-8 bg-white p-6 shadow-2xl transition-transform duration-300 ease-out ${
						open ? "translate-x-0" : "translate-x-full"
					}`}
				>
					<div className="flex items-center justify-between">
						<Logo size="sm" />
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="tap-target inline-flex items-center justify-center rounded-lg text-foreground"
							aria-label="Close menu"
						>
							<X className="size-6" aria-hidden="true" />
						</button>
					</div>
					<nav className="flex flex-col gap-1" aria-label="Primary">
						{NAV_LINKS.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={handleNavClick(link.href)}
								className="rounded-lg px-3 py-3 text-b1 text-neutral-600 transition-colors duration-200 hover:bg-muted hover:text-foreground"
							>
								{link.label}
							</a>
						))}
					</nav>
					<div className="mt-auto flex flex-col gap-3">
						<Button
							asChild
							variant="outline"
							size="large"
							className="w-full border-primary-500 text-primary-500 hover:bg-primary-500/5"
						>
							<Link href={appUrl("/auth/sign-in")}>Sign in</Link>
						</Button>
						<Button asChild variant="primary" size="large" className="w-full">
							<Link href={appUrl("/auth/sign-up")}>Get Started</Link>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}

export { Navbar };
