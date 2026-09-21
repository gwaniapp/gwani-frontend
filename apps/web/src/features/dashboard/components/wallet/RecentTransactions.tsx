import { Navigation } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { formatDate, formatSignedAmount, formatTime } from "@/lib/format";

export interface WalletTransaction {
	id: string;
	title: string;
	/** ISO timestamp. */
	date: string;
	/** Signed: positive is money in, negative is money out. */
	amount: number;
	asset: string;
}

/**
 * Recent payments. Money in is green with a "+", money out red with a "−"; the
 * arrow points down-left for incoming and up-right for outgoing. The backend has
 * no wallet-transaction list, so these are the person's *paid jobs* (released
 * escrow), newest first — every one is a completed payment. Dates are absolute
 * (UTC) so the server and browser render the same thing.
 */
function RecentTransactions({ transactions, loading }: { transactions: WalletTransaction[]; loading: boolean }) {
	return (
		<section aria-labelledby="recent-transactions" className="flex flex-col gap-2 lg:gap-4">
			<div className="flex items-center justify-between gap-4 lg:px-7.5">
				<h2 id="recent-transactions" className="text-b1 font-medium text-foreground lg:text-lg">
					Recent Transactions
				</h2>
			</div>

			{loading ? (
				<div className="flex flex-col gap-3 lg:px-7.5" aria-busy="true" aria-label="Loading transactions">
					{[0, 1, 2].map((row) => (
						<Skeleton key={row} className="h-16 w-full rounded-xl" />
					))}
				</div>
			) : transactions.length === 0 ? (
				<p className="px-1 py-4 text-b3 text-neutral-500 lg:px-7.5 lg:text-b1">No payments yet. Released payments will show up here.</p>
			) : (
				<ul className="flex flex-col divide-y divide-border lg:divide-y-0">
					{transactions.map((tx) => {
						const incoming = tx.amount > 0;
						return (
							<li key={tx.id} className="flex items-center gap-3 px-1 py-4 lg:gap-4 lg:px-7.5 lg:py-4.5">
								<span
									aria-hidden="true"
									className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100/40 text-primary-500 lg:size-15"
								>
									<Navigation className={cn("size-5 fill-current lg:size-7", incoming && "rotate-180")} strokeWidth={1.5} />
								</span>
								<div className="flex min-w-0 flex-1 flex-col gap-0.5 lg:gap-1.5">
									<p className="truncate text-b3 font-medium text-foreground lg:text-b1 lg:font-normal">{tx.title}</p>
									<p className="text-c1 text-neutral-500 lg:text-b1">
										{formatDate(tx.date)}, {formatTime(tx.date)}
									</p>
								</div>
								<div className="flex shrink-0 flex-col items-end gap-1 lg:gap-1.5">
									<p className={cn("text-b3 font-medium lg:text-b1 lg:font-medium", incoming ? "text-[#0a7b4e]" : "text-danger-500")}>
										<span className="sr-only">{incoming ? "Received " : "Sent "}</span>
										{formatSignedAmount(tx.amount, tx.asset)}
									</p>
									<span className="text-c1 text-neutral-500 lg:rounded-full lg:bg-success-100 lg:px-4 lg:py-0.5 lg:text-b3 lg:text-success-700">Completed</span>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</section>
	);
}

export { RecentTransactions };
