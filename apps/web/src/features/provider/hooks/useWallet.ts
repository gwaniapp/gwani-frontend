import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import { FreighterError, signWalletChallenge } from "@/lib/freighter";
import type { WalletMode } from "@/lib/stores/walletFlowStore";
import type { ApiSuccessResponse, BootstrapWalletData, Wallet, WalletLinkChallengeData } from "@/lib/api/types";

const WALLET_KEY = ["wallet", "me"];

/**
 * `GET /wallet/me` — the active wallet: the provider's linked one if they have
 * one (`type: "linked"`), otherwise the platform-managed custodial wallet
 * (`type: "custodial"`, with `funded` / `trustline_created` flags).
 *
 * **Never cached:** the balance changes on-chain without this app doing
 * anything, so every mount fetches fresh (`staleTime: 0`, `refetchOnMount:
 * "always"`) and the result is dropped once nothing shows it (`gcTime: 0`).
 * `live` (the Wallet page) also re-fetches every 15 seconds.
 */
function useWallet({ live = false }: { live?: boolean } = {}) {
	return useQuery({
		queryKey: WALLET_KEY,
		staleTime: 0,
		gcTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: true,
		refetchInterval: live ? 15_000 : false,
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<Wallet>>(apiRoutes.wallet.ME);
			return data.data;
		},
	});
}

type LinkStep = "challenge" | "sign" | "verify";

/** A wallet-link failure tagged with the step it happened in — the same HTTP status means different things at each. */
class WalletLinkError extends Error {
	constructor(
		public step: LinkStep,
		public cause: unknown,
	) {
		super(`Wallet link failed at ${step}`);
	}
}

/** True when a custodial wallet exists but friendbot funding or the stablecoin trustline hasn't completed (yet). */
function isWalletSetupIncomplete(wallet: Pick<Wallet, "type" | "funded" | "trustline_created"> | undefined) {
	return wallet?.type === "custodial" && (!wallet.funded || !wallet.trustline_created);
}

/**
 * Sets a provider's wallet up, either way:
 *
 * - `generate` → `POST /wallet/me/bootstrap` (idempotent): creates the custodial
 *   wallet, then funds it through friendbot and adds the stablecoin trustline.
 *   Testnet friendbot is flaky, so a wallet that exists but isn't fully funded
 *   yet is *not* a failure — the wallet screens show a "finish setup" notice
 *   (`isWalletSetupIncomplete`) and calling this again retries the rest.
 * - `link` → `POST /wallet/link/challenge` `{ public_key }`, Freighter signs the
 *   challenge, then `POST /wallet/link/verify` `{ public_key, signature }`. On
 *   success the linked wallet replaces the custodial one for escrow payouts. See
 *   `lib/freighter.ts` for a signature-format caveat.
 */
function useConnectWallet() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "provider.connect-wallet" },
		mutationFn: async ({ mode, publicKey }: { mode: WalletMode; publicKey: string }) => {
			if (mode === "generate") {
				const { data } = await axiosAuth.post<ApiSuccessResponse<BootstrapWalletData>>(apiRoutes.wallet.BOOTSTRAP);
				return { mode, complete: Boolean(data.data.funded && data.data.trustline_created) };
			}
			const challenge = await axiosAuth
				.post<ApiSuccessResponse<WalletLinkChallengeData>>(apiRoutes.wallet.LINK_CHALLENGE, { public_key: publicKey })
				.catch((error: unknown) => {
					throw new WalletLinkError("challenge", error);
				});
			const signature = await signWalletChallenge(publicKey, challenge.data.data.challenge);
			await axiosAuth.post(apiRoutes.wallet.LINK_VERIFY, { public_key: publicKey, signature }).catch((error: unknown) => {
				throw new WalletLinkError("verify", error);
			});
			return { mode, complete: true };
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: WALLET_KEY });
		},
	});
}

/** A sentence for the failure screen, whatever went wrong. */
function walletErrorMessage(error: unknown): string {
	if (error instanceof FreighterError) {
		switch (error.code) {
			case "not-installed":
				return "We couldn't find the Freighter wallet in this browser. Install the Freighter extension and try again, or generate a wallet instead.";
			case "rejected":
				return "The request was cancelled or blocked in Freighter. Unlock Freighter, approve the request and try again.";
			case "mismatch":
				return "Freighter is using a different account than the one you entered. Switch accounts in Freighter or enter the address it's using.";
			default:
				return "Freighter couldn't complete the request. Please try again.";
		}
	}
	if (error instanceof WalletLinkError) {
		const status = isAxiosError(error.cause) ? error.cause.response?.status : undefined;
		if (error.step === "verify" && (status === 401 || status === 400)) {
			return "We couldn't verify the signature from your wallet, or the request expired. Please try again.";
		}
		if (error.step === "challenge" && status === 401) {
			return "We couldn't start linking your wallet because the server didn't accept this request. Please sign out, sign in again and retry.";
		}
		return walletErrorMessage(error.cause);
	}
	return getApiErrorMessage(
		error,
		"We couldn't connect your wallet. Please try again.",
		{ 409: "That wallet is already linked to an account, or you already have a linked wallet.", 400: "That doesn't look like a valid Stellar public key." },
	);
}

export { isWalletSetupIncomplete, useConnectWallet, useWallet, WALLET_KEY, walletErrorMessage };
