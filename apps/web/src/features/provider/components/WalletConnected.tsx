"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { isWalletSetupIncomplete, useConnectWallet, useWallet } from "@/features/provider/hooks/useWallet";
import { useWalletFlowStore } from "@/lib/stores/walletFlowStore";

/**
 * Success screen after connecting or generating a wallet. Shows the provider's
 * real active wallet (`GET /wallet/me`), masked (copy still copies the whole
 * key); the address stays blank until it has loaded, and says so if it can't.
 */
function WalletConnected() {
	const wallet = useWallet();
	const finish = useConnectWallet();
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

			{wallet.isError ? (
				<p role="alert" className="text-center text-b3 text-danger-600">
					We couldn&apos;t load your wallet address.{" "}
					<button type="button" onClick={() => void wallet.refetch()} className="font-medium underline underline-offset-4">
						Try again
					</button>
				</p>
			) : (
				<WalletAddressCard publicKey={wallet.data?.public_key ?? ""} ready={Boolean(wallet.data)} verified={wallet.data ? !isWalletSetupIncomplete(wallet.data) : undefined} />
			)}

			{isWalletSetupIncomplete(wallet.data) && (
				<div role="status" className="flex flex-col gap-3 rounded-2xl border border-warning-200 bg-warning-50 p-4 text-b3 text-foreground">
					<p>
						Your wallet has been created, but the test funds or the payment token setup haven&apos;t finished yet. You can carry on and finish this later,
						or try again now.
					</p>
					<Button type="button" variant="outline" loading={finish.isPending} onClick={() => finish.mutate({ mode: "generate", publicKey: "" })} className="self-start">
						Finish setup
					</Button>
				</div>
			)}

			<Button asChild size="large" className="h-11 w-full md:h-15 md:text-btn-giant">
				<Link href="/provider/dashboard" onClick={reset}>
					Go to Dashboard
				</Link>
			</Button>
		</div>
	);
}

export { WalletConnected };
