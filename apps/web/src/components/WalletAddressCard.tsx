"use client";

import { Copy } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "@repo/ui/sonner";
import { maskPublicKey } from "@/lib/wallet";

interface WalletAddressCardProps {
	publicKey: string;
	/** False until the key is known (e.g. still loading from storage) — the address stays blank rather than show a wrong one. */
	ready?: boolean;
	network?: string;
	/**
	 * The wallet's state, from the backend's flags: `true` = ready ("Verified"), `false` = funding or the payment-token
	 * setup isn't finished ("Setup incomplete"), omitted = unknown (someone else's wallet), so no badge is shown.
	 */
	verified?: boolean;
	className?: string;
}

/** A wallet's address (masked — copy still copies the whole key), a status badge taken from the wallet's real state, and network. */
function WalletAddressCard({ publicKey, ready = true, network = "Stellar", verified, className }: WalletAddressCardProps) {
	async function copyAddress() {
		try {
			await navigator.clipboard.writeText(publicKey);
			toast.success("Wallet address copied");
		} catch {
			toast.error("Couldn't copy the address");
		}
	}

	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-3xl bg-primary-100/30 p-5 shadow-[0_8px_30px_rgb(0_0_0/0.04)] md:gap-4 md:p-7.5",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<p className="text-b1 text-foreground md:text-b1 2xl:text-lg">Wallet address</p>
				{/* The design's own emerald — deeper and greyer than the stock success ramp. */}
				{verified === true && <span className="rounded-full bg-success-100 px-4 py-1.5 text-b3 text-[#0a7b4e] md:py-1">Verified</span>}
				{verified === false && <span className="rounded-full bg-warning-100 px-4 py-1.5 text-b3 text-warning-700 md:py-1">Setup incomplete</span>}
			</div>
			<div className="flex items-center gap-3">
				<p
					className="min-h-8 text-xl font-medium text-foreground md:text-xl"
					aria-label={ready ? "Masked wallet address" : undefined}
				>
					{ready ? maskPublicKey(publicKey) : ""}
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
			<p className="text-c1 text-foreground md:text-b1">Network: {network}</p>
		</div>
	);
}

export { WalletAddressCard };
