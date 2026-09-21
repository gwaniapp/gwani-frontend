"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConnectWallet, walletErrorMessage } from "@/features/provider/hooks/useWallet";
import { useWalletFlowStore } from "@/lib/stores/walletFlowStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

/**
 * Does the actual wallet work while the spinner shows: generating the custodial
 * wallet, or linking the one the provider entered (see `useConnectWallet`). On
 * success it moves to the connected screen; on failure it records why in the
 * flow store and moves to the failed screen. Guarded so React's dev-mode double
 * effect can't fire the requests twice.
 */
function WalletConnecting() {
	const router = useRouter();
	const hydrated = useStoreHydrated(useWalletFlowStore.persist);
	const connect = useConnectWallet();
	const started = useRef(false);

	useEffect(() => {
		if (!hydrated || started.current) return;
		started.current = true;
		const { mode, publicKey } = useWalletFlowStore.getState();

		connect.mutate(
			{ mode, publicKey },
			{
				onSuccess: () => router.replace("/provider/wallet/connected"),
				onError: (error) => {
					useWalletFlowStore.getState().fail(walletErrorMessage(error));
					router.replace("/provider/wallet/failed");
				},
			},
		);
		// `connect` is stable enough for a run-once effect; re-running would repeat the requests.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hydrated, router]);

	return (
		<div role="status" className="flex flex-col items-center gap-8 text-center md:gap-21">
			<svg viewBox="0 0 96 96" className="size-20 animate-spin motion-reduce:animate-none md:size-24" aria-hidden="true">
				<circle
					cx="48"
					cy="48"
					r="42"
					fill="none"
					strokeWidth="8"
					strokeLinecap="round"
					strokeDasharray="230 34"
					className="stroke-primary-500"
				/>
			</svg>
			<div className="flex flex-col items-center gap-2 md:gap-7">
				<h1 className="text-h4 font-medium text-foreground md:text-4xl">Connecting your wallet</h1>
				<p className="text-b3 text-foreground md:text-xl">This may take a few seconds</p>
			</div>
		</div>
	);
}

export { WalletConnecting };
