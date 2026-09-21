"use client";

import { Clock, Lock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { QueryError } from "@/components/QueryState";
import { WalletAddressCard } from "@/components/WalletAddressCard";
import { BalanceCard } from "@/features/dashboard/components/wallet/BalanceCard";
import { RecentTransactions, type WalletTransaction } from "@/features/dashboard/components/wallet/RecentTransactions";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { useConnectWallet, useWallet, walletErrorMessage } from "@/features/provider/hooks/useWallet";
import { sumPrices } from "@/lib/jobs";

type Role = "provider" | "client";

/**
 * The wallet page for either role. **What's real:** the address, its type,
 * whether it's funded and the USDC balance (`GET /wallet/me`, shown as "Wallet
 * Balance"). **What's derived:** the backend has no transactions endpoint, so
 * the tiles and the transaction list are worked out from the person's jobs and
 * labelled accordingly —
 *
 * - provider: *Pending Earnings* = finished work waiting for the client to
 *   release, *In Escrow* = locked for work in progress; transactions = PAID jobs;
 * - client: *Awaiting Your Release* = finished work you haven't paid for yet,
 *   *In Escrow* = locked for work in progress; transactions = PAID jobs.
 *
 * Both requests are "live" here (never served from cache, re-fetched every 15s
 * and on focus) so the balance and payments track what happens on-chain.
 * Withdrawing has no endpoint (the button says
 * so); a client whose wallet isn't set up gets a "Set up wallet" button
 * (`POST /wallet/me/bootstrap`), needed before funding escrow.
 */
function WalletView({ role }: { role: Role }) {
	const wallet = useWallet({ live: true });
	const jobs = useJobs(role, { live: true });
	const bootstrap = useConnectWallet();

	const all = jobs.data ?? [];
	const loading = jobs.isPending;
	const provider = role === "provider";

	const transactions: WalletTransaction[] = all
		.filter((job) => job.status === "PAID")
		.slice(0, 8)
		.map((job) => ({
			id: job.id,
			title: provider ? `Payment received for ${job.title}` : `Payment released for ${job.title}`,
			date: job.updated_at ?? job.created_at,
			amount: provider ? Number(job.price_amount) : -Number(job.price_amount),
			asset: job.price_asset,
		}));

	const needsSetup = wallet.data && !(wallet.data.funded && wallet.data.trustline_created) && wallet.data.type === "custodial";

	const action = provider ? (
		<Button
			type="button"
			variant="ghost"
			size="large"
			className="w-64 max-w-full self-center bg-white text-foreground hover:bg-white/90 focus-visible:bg-white lg:w-auto lg:self-start lg:px-12"
			onClick={() => toast.info("Withdrawals aren't available yet.")}
		>
			Withdraw
		</Button>
	) : needsSetup ? (
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
	) : undefined;

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
						{ icon: Lock, label: "In Escrow", amount: sumPrices(all, ["FUNDED", "IN_PROGRESS"]) },
					]}
				/>
			)}

			{wallet.isError ? (
				<QueryError message="We couldn't load your wallet address." onRetry={() => void wallet.refetch()} />
			) : (
				<WalletAddressCard publicKey={wallet.data?.public_key ?? ""} ready={Boolean(wallet.data)} />
			)}

			<RecentTransactions transactions={transactions} loading={loading} />
		</div>
	);
}

export { WalletView };
