"use client";

import { useState } from "react";
import { Clock, Lock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { QueryError } from "@/components/QueryState";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { BalanceCard } from "@/features/dashboard/components/wallet/BalanceCard";
import { RecentTransactions, type WalletTransaction } from "@/features/dashboard/components/wallet/RecentTransactions";
import { WithdrawDialog } from "@/features/dashboard/components/wallet/WithdrawDialog";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { isWalletSetupIncomplete, useConnectWallet, useWallet, useWalletTransactions, walletErrorMessage } from "@/features/provider/hooks/useWallet";
import { sumPrices } from "@/lib/jobs";

type Role = "provider" | "client";

const TITLES = {
	FUND: (job: string) => `Escrow funded for ${job}`,
	REFUND: (job: string) => `Escrow refunded for ${job}`,
	RELEASE: (job: string) => `Payment received for ${job}`,
} as const;

/**
 * The wallet page for either role. **What's real:** the address, its type,
 * whether it's funded and the USDC balance (`GET /wallet/me`, shown as "Wallet
 * Balance") and the transaction list (`GET /wallet/transactions`), plus a
 * provider's escrow (`funds_in_escrow`). **What's derived from the jobs list:**
 * *Pending Earnings* / *Awaiting Your Release* (finished work not yet released)
 * and a client's *In Escrow* (the backend reports 0 for clients).
 *
 * Both requests are "live" here (never served from cache, re-fetched every 15s
 * and on focus) so the balance and payments track what happens on-chain.
 * Withdraw (`POST /wallet/transfer`, see `WithdrawDialog`) sends the on-hand balance to any
 * Stellar address. A custodial wallet
 * that isn't fully set up (`trustline_created: false`) gets a "Set up wallet"
 * button (`POST /wallet/me/bootstrap`), needed before funding escrow.
 */
function WalletView({ role }: { role: Role }) {
	const wallet = useWallet({ live: true });
	const jobs = useJobs(role, { live: true });
	const bootstrap = useConnectWallet();
	const [withdrawOpen, setWithdrawOpen] = useState(false);

	const all = jobs.data ?? [];
	const loading = jobs.isPending;
	const provider = role === "provider";
	const history = useWalletTransactions({ live: true });
	const transactions: WalletTransaction[] = (history.data ?? []).map((tx) => ({
		id: tx.id,
		title: TITLES[tx.type](tx.job_title),
		date: tx.confirmed_at ?? tx.submitted_at,
		amount: tx.direction === "in" ? Number(tx.amount) : -Number(tx.amount),
		asset: tx.asset,
		status: tx.status === "FAILED" ? "failed" : tx.confirmed_at ? "completed" : "pending",
	}));

	const needsSetup = wallet.data && !(wallet.data.funded && wallet.data.trustline_created) && wallet.data.type === "custodial";

	const balance = Number(wallet.data?.usdc_balance ?? 0) || 0;
	const withdraw = (
		<Button
			type="button"
			variant="ghost"
			size="large"
			disabled={!wallet.data || balance <= 0}
			className="w-64 max-w-full self-center bg-white text-foreground hover:bg-white/90 focus-visible:bg-white lg:w-auto lg:self-start lg:px-12"
			onClick={() => setWithdrawOpen(true)}
		>
			Withdraw
		</Button>
	);
	const setup = needsSetup ? (
		<Button
			type="button"
			variant="ghost"
			size="large"
			loading={bootstrap.isPending}
			className="w-64 max-w-full self-center bg-white text-foreground hover:bg-white/90 focus-visible:bg-white lg:w-auto lg:self-start lg:px-10"
			onClick={() =>
				bootstrap.mutate(
					{ mode: "generate", publicKey: "" },
					{
						onSuccess: () => toast.success("Your wallet is set up."),
						onError: (error) => toast.error(walletErrorMessage(error)),
					},
				)
			}
		>
			Set up wallet
		</Button>
	) : null;
	const action = (
		<div className="flex flex-col gap-3 self-center lg:flex-row lg:self-start">
			{withdraw}
			{setup}
		</div>
	);

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<h1 className="sr-only lg:not-sr-only lg:text-h4 2xl:text-h3 lg:font-medium lg:text-foreground">Wallet</h1>

			{wallet.isError || jobs.isError ? (
				<QueryError
					message={wallet.isError ? "We couldn't load your wallet balance." : "We couldn't load your payments."}
					onRetry={() => void (wallet.isError ? wallet.refetch() : jobs.refetch())}
				/>
			) : (
				<BalanceCard
					label="Wallet Balance"
					amount={Number(wallet.data?.usdc_balance ?? 0) || 0}
					asset="USDC"
					loading={wallet.isPending}
					tilesLoading={loading}
					action={action}
					tiles={[
						{ icon: Clock, label: provider ? "Pending Earnings" : "Awaiting Your Release", amount: sumPrices(all, ["COMPLETED"]) },
						{
							icon: Lock,
							label: "In Escrow",
							// A provider's escrow is real (`funds_in_escrow`); the backend reports "0" for a client, so theirs is worked out from their jobs.
							amount: provider ? Number(wallet.data?.funds_in_escrow ?? 0) || 0 : sumPrices(all, ["FUNDED", "IN_PROGRESS"]),
						},
					]}
				/>
			)}

			{wallet.isError ? (
				<QueryError message="We couldn't load your wallet address." onRetry={() => void wallet.refetch()} />
			) : (
				<WalletAddressCard publicKey={wallet.data?.public_key ?? ""} ready={Boolean(wallet.data)} verified={wallet.data ? !isWalletSetupIncomplete(wallet.data) : undefined} />
			)}

			{wallet.data && (
				<WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} available={balance} asset="USDC" ownAddress={wallet.data.public_key} />
			)}

			<RecentTransactions transactions={transactions} loading={history.isPending} error={history.isError} />
		</div>
	);
}

export { WalletView };
