import Link from "next/link";
import { Briefcase, User, Wallet, type LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";

const ACTIONS: Array<{ label: string; href: string; icon: LucideIcon; primary?: boolean }> = [
	{ label: "Post a New Job", href: "/client/dashboard/jobs/new", icon: Briefcase, primary: true },
	{ label: "Find Providers", href: "/client/dashboard/providers", icon: User },
	{ label: "Wallet", href: "/client/dashboard/wallet", icon: Wallet },
];

/** The three things a client most often does, one tap from the overview. */
function QuickActions() {
	return (
		<section
			aria-labelledby="quick-actions"
			className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-[0_4px_24px_rgb(0_0_0/0.06)] lg:gap-6 lg:p-7.5"
		>
			<h2 id="quick-actions" className="text-b1 font-medium text-foreground lg:text-xl">
				Quick Actions
			</h2>
			<div className="grid gap-3 lg:grid-cols-3 lg:gap-7">
				{ACTIONS.map(({ label, href, icon: Icon, primary }) => (
					<Button
						key={href}
						asChild
						variant={primary ? "primary" : "outline"}
						size="large"
						className={cn(
							"w-full lg:h-15 lg:text-s1 lg:font-normal",
							!primary && "border-primary-500 text-primary-500 hover:bg-primary-100/30 focus-visible:bg-primary-100/30",
						)}
					>
						<Link href={href}>
							<Icon className="size-4 lg:size-5" strokeWidth={1.5} aria-hidden="true" />
							{label}
						</Link>
					</Button>
				))}
			</div>
		</section>
	);
}

export { QuickActions };
