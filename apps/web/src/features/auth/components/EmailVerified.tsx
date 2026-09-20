import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { Button } from "@repo/ui/button";
import type { SignUpRole } from "@/lib/api/types";

// Only the provider version is designed so far; the client label/destination
// is a placeholder. Neither destination screen exists yet.
const NEXT_STEP: Record<SignUpRole, { label: string; href: string }> = {
	PROVIDER: { label: "Create my provider profile", href: "/provider/onboarding" },
	CLIENT: { label: "Find a provider", href: "/client/dashboard/providers" },
};

/** Shown once the email is verified — one action, chosen by the account's role. */
function EmailVerified({ role }: { role: SignUpRole }) {
	const { label, href } = NEXT_STEP[role];

	return (
		<div className="flex flex-col gap-15 md:gap-18">
			<div className="flex flex-col items-center gap-8 text-center md:gap-16">
				<CircleCheckBig className="-mt-3 size-38 text-primary-500" strokeWidth={0.4} aria-hidden="true" />
				<h1 className="text-xl font-medium text-foreground md:text-4xl">Email Verified Successfully!</h1>
			</div>

			<Button asChild size="large" className="h-11 w-full md:h-15 md:text-btn-giant">
				<Link href={href}>{label}</Link>
			</Button>
		</div>
	);
}

export { EmailVerified };
