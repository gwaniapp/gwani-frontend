"use client";

import { useState } from "react";
import { Clock, Eye, EyeOff, TrendingUp, type LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/sonner";
import { formatMoney } from "@/lib/format";
import { MOCK_WALLET } from "@/lib/mock/providerWallet";

function Tile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
	return (
		<div className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 lg:gap-4 lg:rounded-2xl lg:p-5">
			<span className="flex shrink-0 items-center justify-center text-primary-500 lg:size-10 lg:rounded-full lg:bg-primary-100/50">
				<Icon className="size-4 lg:size-5" aria-hidden="true" />
			</span>
			<div className="flex min-w-0 flex-col lg:gap-1">
				<p className="text-c1 text-foreground lg:text-b3">{label}</p>
				<p className="text-c1 font-medium text-foreground lg:text-s1 lg:font-medium">{value}</p>
			</div>
		</div>
	);
}

/**
 * The balance banner with the two summary tiles tucked under its bottom edge.
 * The eye hides the balance (a "•" mask) — only the balance, as in the mock.
 * Withdraw has no design yet, so it just says so.
 */
function BalanceCard() {
	const [hidden, setHidden] = useState(false);
	const { asset } = MOCK_WALLET;

	return (
		<section aria-label="Balance" className="overflow-hidden rounded-3xl bg-[#f4f4ff]">
			<div className="flex flex-col gap-5 bg-primary-500 px-5 pt-6 pb-10 text-white lg:flex-row lg:items-start lg:justify-between lg:px-7.5 lg:pt-7 lg:pb-9">
				<div className="flex flex-col gap-2 lg:gap-3">
					<div className="flex items-center justify-between gap-6 lg:justify-start lg:gap-10">
						<p className="text-b1 lg:text-xl">Wallet Balance</p>
						<button
							type="button"
							onClick={() => setHidden((value) => !value)}
							aria-label={hidden ? "Show balance" : "Hide balance"}
							aria-pressed={hidden}
							className="flex size-8 items-center justify-center rounded-md outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
						>
							{hidden ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
						</button>
					</div>
					<p className="text-h4 font-medium lg:text-h3 lg:font-medium" aria-live="polite">
						{hidden ? `•••••• ${asset}` : formatMoney(MOCK_WALLET.balance, asset)}
					</p>
				</div>
				<Button
					type="button"
					variant="ghost"
					size="large"
					className="w-64 max-w-full self-center bg-white text-foreground hover:bg-white/90 focus-visible:bg-white lg:w-auto lg:self-start lg:px-12"
					onClick={() => toast.info("Withdrawals aren't available yet.")}
				>
					Withdraw
				</Button>
			</div>

			<div className="-mt-5 rounded-t-3xl bg-[#f4f4ff] p-3 lg:p-5">
				<div className="grid grid-cols-2 gap-3 lg:gap-8">
					<Tile icon={Clock} label="Pending Earnings" value={formatMoney(MOCK_WALLET.pendingEarnings, asset)} />
					<Tile icon={TrendingUp} label="Total Earned" value={formatMoney(MOCK_WALLET.totalEarned, asset)} />
				</div>
			</div>
		</section>
	);
}

export { BalanceCard };
