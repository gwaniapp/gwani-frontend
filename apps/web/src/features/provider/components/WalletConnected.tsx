"use client";

import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { maskPublicKey, SAMPLE_PUBLIC_KEY } from "@/lib/wallet";
import { useWalletFlowStore } from "@/lib/stores/walletFlowStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

/**
 * Success screen after connecting or generating a wallet. Shows the key masked
 * (copy still copies the whole thing). Opened directly, with no wallet in the
 * flow store, it shows a sample address so the design can be previewed.
 */
function WalletConnected() {
	const hydrated = useStoreHydrated(useWalletFlowStore.persist);
	const storedKey = useWalletFlowStore((state) => state.publicKey);
	const reset = useWalletFlowStore((state) => state.reset);
	const publicKey = storedKey || SAMPLE_PUBLIC_KEY;

	async function copyAddress() {
		try {
			await navigator.clipboard.writeText(publicKey);
			toast.success("Wallet address copied");
		} catch {
			toast.error("Couldn't copy the address");
		}
	}

	return (
		<div className="flex flex-col gap-8 md:gap-15">
			<div className="flex flex-col items-center gap-8 text-center md:gap-16">
				{/* The design's own emerald — deeper and greyer than the stock success ramp. */}
				<span className="flex size-36 shrink-0 items-center justify-center rounded-full bg-[#e4f1ec]">
					<span className="flex size-21 items-center justify-center rounded-full bg-[#0a7b4e]">
						<span className="flex size-10 items-center justify-center rounded-full bg-white text-[#0a7b4e]">
							<Check className="size-5" strokeWidth={3} aria-hidden="true" />
						</span>
					</span>
				</span>
				<div className="flex flex-col items-center gap-2 md:gap-4">
					<h1 className="text-h4 font-medium text-foreground md:text-4xl">Wallet Connected!</h1>
					<p className="text-b3 text-neutral-500 md:text-xl">
						You&apos;re all set. Your wallet is now linked to Gwani.
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-3 rounded-3xl bg-primary-100/30 p-5 shadow-[0_8px_30px_rgb(0_0_0/0.04)] md:gap-4 md:p-7.5">
				<div className="flex items-start justify-between gap-3">
					<p className="text-b1 text-foreground md:text-xl">Wallet address</p>
					<span className="rounded-full bg-success-100 px-4 py-1.5 text-b3 text-[#0a7b4e] md:py-1">
						Verified
					</span>
				</div>
				<div className="flex items-center gap-3">
					<p
						className="min-h-8 text-xl font-medium text-foreground md:text-2xl"
						aria-label={hydrated ? "Masked wallet address" : undefined}
					>
						{hydrated ? maskPublicKey(publicKey) : ""}
					</p>
					<button
						type="button"
						onClick={copyAddress}
						aria-label="Copy wallet address"
						className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-primary-100/60 focus-visible:ring-2 focus-visible:ring-primary-300"
					>
						<Copy className="size-5" aria-hidden="true" />
					</button>
				</div>
				<p className="text-c1 text-foreground md:text-b1">Network: Stellar</p>
			</div>

			<Button asChild size="large" className="h-11 w-full md:h-15 md:text-btn-giant">
				<Link href="/provider/dashboard" onClick={reset}>
					Go to Dashboard
				</Link>
			</Button>
		</div>
	);
}

export { WalletConnected };
