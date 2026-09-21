"use client";

import Link from "next/link";
import { Info, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Logo } from "@repo/ui/logo";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useWalletFlowStore } from "@/lib/stores/walletFlowStore";
import { SUPPORT_EMAIL } from "@/lib/site";

const RETRY_HREF = "/provider/wallet";

const DEFAULT_MESSAGE = "We couldn't connect your wallet. Please try again or check if your wallet is unlocked.";

/**
 * Full-page "Connection Failed" screen — reached when connecting or generating
 * the wallet doesn't go through. Says why when it knows (the connecting screen
 * records the reason in the flow store).
 */
function WalletFailed() {
	const hydrated = useStoreHydrated(useWalletFlowStore.persist);
	const reason = useWalletFlowStore((state) => state.error);

	return (
		<div className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-100/10 px-5 py-6 sm:px-10 lg:py-5 lg:pr-15 lg:pl-20">
			<span aria-hidden="true" className="pointer-events-none absolute -bottom-44 -left-40 size-96 rounded-full bg-danger-100/30" />
			<span aria-hidden="true" className="pointer-events-none absolute -right-40 -bottom-52 size-128 rounded-full bg-danger-100/25" />

			<header className="relative flex items-center justify-between">
				<Link href="/" aria-label="Gwani home">
					<Logo size="lg" />
				</Link>
				<Link
					href={RETRY_HREF}
					className="inline-flex items-center gap-2 text-b4 text-primary-500 outline-none hover:underline focus-visible:underline"
				>
					<RefreshCw className="size-4" aria-hidden="true" />
					Try Again
				</Link>
			</header>

			<main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
				<span aria-hidden="true" className="relative flex size-36 shrink-0 items-center justify-center rounded-full bg-danger-100/60">
					<span className="absolute top-12 -left-8 size-4 rounded-full bg-danger-100/70" />
					<span className="absolute top-8 -right-6 size-5 rounded-full bg-danger-100/70" />
					<svg viewBox="0 0 64 64" className="size-20">
						<path
							d="M28.2 8.5a4.4 4.4 0 0 1 7.6 0l24 41.6A4.4 4.4 0 0 1 56 56.7H8a4.4 4.4 0 0 1-3.8-6.6l24-41.6Z"
							className="fill-danger-500"
						/>
						<rect x="29.5" y="22" width="5" height="18" rx="2.5" className="fill-white" />
						<circle cx="32" cy="47" r="3" className="fill-white" />
					</svg>
				</span>

				<div className="flex flex-col items-center gap-3">
					<h1 className="text-h4 font-medium text-foreground md:text-4xl">Connection Failed</h1>
					<p className="max-w-md text-b3 text-neutral-500 md:text-b1">
						{hydrated && reason ? reason : DEFAULT_MESSAGE}
					</p>
				</div>

				<div className="flex w-full max-w-md flex-col gap-4">
					<Button asChild size="large" className="h-11 w-full md:h-15 md:text-btn-giant">
						<Link href={RETRY_HREF}>Try Again</Link>
					</Button>
					<Button
						asChild
						size="large"
						variant="outline"
						className="h-11 w-full border-primary-200 text-primary-600 md:h-15 md:text-btn-giant"
					>
						<Link href="/">Back to Home</Link>
					</Button>
				</div>

				<p className="flex items-center gap-2 text-c1 text-muted-foreground md:text-b3">
					<Info className="size-4" aria-hidden="true" />
					<span>
						Need help?{" "}
						<a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-500 underline-offset-4 hover:underline">
							Contact support
						</a>
					</span>
				</p>
			</main>
		</div>
	);
}

export { WalletFailed };
