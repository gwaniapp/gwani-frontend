"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { SAMPLE_PUBLIC_KEY } from "@/lib/wallet";
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

			<WalletAddressCard publicKey={storedKey || SAMPLE_PUBLIC_KEY} ready={hydrated} />

			<Button asChild size="large" className="h-11 w-full md:h-15 md:text-btn-giant">
				<Link href="/provider/dashboard" onClick={reset}>
					Go to Dashboard
				</Link>
			</Button>
		</div>
	);
}

export { WalletConnected };
