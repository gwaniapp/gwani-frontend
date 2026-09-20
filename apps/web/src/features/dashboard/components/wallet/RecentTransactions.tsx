import Link from "next/link";
import { Navigation } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { formatDate, formatSignedAmount, formatTime } from "@/lib/format";
import { MOCK_TRANSACTIONS, MOCK_WALLET, type WalletTransactionStatus } from "@/lib/mock/providerWallet";

const STATUS: Record<WalletTransactionStatus, { label: string; pill: string }> = {
	COMPLETED: { label: "Completed", pill: "lg:bg-success-100 lg:text-success-700" },
	PENDING: { label: "Pending", pill: "lg:bg-orange-100 lg:text-orange-600" },
	FAILED: { label: "Failed", pill: "lg:bg-danger-100 lg:text-danger-700" },
};

/**
 * The latest wallet activity. Money in is green with a "+", money out red with
 * a "−"; the arrow points down-left for incoming and up-right for outgoing. The
 * status is a pill on desktop and plain grey text on phones, as in the mocks.
 * The mock's dates were relative ("Today, 10:26 AM"); these are absolute (UTC)
 * so the server and browser render the same thing.
 */
function RecentTransactions() {
	return (
		<section aria-labelledby="recent-transactions" className="flex flex-col gap-2 lg:gap-4">
			<div className="flex items-center justify-between gap-4 lg:px-7.5">
				<h2 id="recent-transactions" className="text-b1 font-medium text-foreground lg:text-lg">
					Recent Transactions
				</h2>
				<Link
					href="/provider/dashboard/wallet/transactions"
					className="text-b3 text-[#0a7b4e] outline-none hover:underline focus-visible:underline lg:text-b1"
				>
					View all
				</Link>
			</div>

			<ul className="flex flex-col divide-y divide-border lg:divide-y-0">
				{MOCK_TRANSACTIONS.map((tx) => {
					const incoming = tx.amount > 0;
					const status = STATUS[tx.status];
					return (
						<li key={tx.id} className="flex items-center gap-3 px-1 py-4 lg:gap-4 lg:px-7.5 lg:py-4.5">
							<span
								aria-hidden="true"
								className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100/40 text-primary-500 lg:size-15"
							>
								<Navigation
									className={cn("size-5 fill-current lg:size-7", incoming && "rotate-180")}
									strokeWidth={1.5}
								/>
							</span>
							<div className="flex min-w-0 flex-1 flex-col gap-0.5 lg:gap-1.5">
								<p className="truncate text-b3 font-medium text-foreground lg:text-b1 lg:font-normal">{tx.title}</p>
								<p className="text-c1 text-neutral-500 lg:text-b1">
									{formatDate(tx.date)}, {formatTime(tx.date)}
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-1 lg:gap-1.5">
								<p
									className={cn(
										"text-b3 font-medium lg:text-b1 lg:font-medium",
										incoming ? "text-[#0a7b4e]" : "text-danger-500",
									)}
								>
									<span className="sr-only">{incoming ? "Received " : "Sent "}</span>
									{formatSignedAmount(tx.amount, MOCK_WALLET.asset)}
								</p>
								<span className={cn("text-c1 text-neutral-500 lg:rounded-full lg:px-4 lg:py-0.5 lg:text-b3", status.pill)}>
									{status.label}
								</span>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}

export { RecentTransactions };
