import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Logo } from "@repo/ui/logo";

/** A URL that isn't a console page. */
export default function NotFound() {
	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-primary-100/10 px-6 text-center">
			<Logo size="lg" className="h-10" />
			<div className="flex flex-col gap-2">
				<p className="text-c1 font-medium tracking-wide text-primary-600 uppercase">404</p>
				<h1 className="text-h4 font-medium text-foreground">That page doesn&apos;t exist</h1>
				<p className="max-w-sm text-b3 text-neutral-500">The link may be old or mistyped. The console&apos;s pages are in the menu.</p>
			</div>
			<Button asChild size="large">
				<Link href="/dashboard">Back to the overview</Link>
			</Button>
		</main>
	);
}
