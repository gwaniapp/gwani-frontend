"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Logo } from "@repo/ui/logo";

/** Something in a page threw: say so plainly, offer a retry, and keep a way back. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("[admin] page error:", error);
	}, [error]);

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-primary-100/10 px-6 text-center">
			<Logo size="lg" className="h-10" />
			<div className="flex flex-col gap-2">
				<h1 className="text-h4 font-medium text-foreground">Something went wrong</h1>
				<p className="max-w-sm text-b3 text-neutral-500">This page hit an unexpected problem. Nothing was changed. Try again, or head back to the overview.</p>
			</div>
			<div className="flex flex-wrap justify-center gap-3">
				<Button type="button" size="large" onClick={reset}>
					Try again
				</Button>
				<Button asChild variant="outline" size="large">
					<Link href="/dashboard">Overview</Link>
				</Button>
			</div>
		</main>
	);
}
