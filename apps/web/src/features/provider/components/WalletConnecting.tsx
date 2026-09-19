"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { simulatedApiError, simulateRequest } from "@/lib/simulation";
import { useWalletFlowStore } from "@/lib/stores/walletFlowStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";

/** A key ending in this fails to connect, so the "Connection Failed" screen can be reached in the simulation. */
const FAIL_SUFFIX = "ZZZZZ";

/**
 * SIMULATED — waits a couple of seconds, then moves on to the connected screen
 * (or the failed one for a key ending in `ZZZZZ`). The real work goes here: for
 * a pasted key, `POST /wallet/link/challenge` → have the wallet sign it →
 * `POST /wallet/link/verify`; for a generated wallet, `POST /wallet/me/bootstrap`.
 */
function WalletConnecting() {
	const router = useRouter();
	const hydrated = useStoreHydrated(useWalletFlowStore.persist);

	useEffect(() => {
		if (!hydrated) return;
		let cancelled = false;
		const { publicKey } = useWalletFlowStore.getState();

		simulateRequest(
			publicKey.endsWith(FAIL_SUFFIX) ? simulatedApiError(400, "Could not connect the wallet") : true,
			2600,
		)
			.then(() => {
				if (!cancelled) router.replace("/provider/wallet/connected");
			})
			.catch(() => {
				if (!cancelled) router.replace("/provider/wallet/failed");
			});

		return () => {
			cancelled = true;
		};
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
