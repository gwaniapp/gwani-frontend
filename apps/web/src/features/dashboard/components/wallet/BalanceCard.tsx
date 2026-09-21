"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Skeleton } from "@repo/ui/skeleton";
import { formatMoney } from "@/lib/format";

interface Tile {
	icon: LucideIcon;
	label: string;
	amount: number;
}

function TileView({ tile, asset, loading }: { tile: Tile; asset: string; loading: boolean }) {
	const Icon = tile.icon;
	return (
		<div className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-3 lg:gap-4 lg:rounded-2xl lg:p-5">
			<span className="flex shrink-0 items-center justify-center text-primary-500 lg:size-10 lg:rounded-full lg:bg-primary-100/50">
				<Icon className="size-4 lg:size-5" aria-hidden="true" />
			</span>
			<div className="flex min-w-0 flex-col lg:gap-1">
				<p className="text-c1 text-foreground lg:text-b3">{tile.label}</p>
				{loading ? (
					<Skeleton className="mt-1 h-4 w-24" />
				) : (
					<p className="text-c1 font-medium text-foreground lg:text-b1 lg:font-medium">{formatMoney(tile.amount, asset)}</p>
				)}
			</div>
		</div>
	);
}

interface BalanceCardProps {
	/** The big number's label, e.g. "Total Earned". */
	label: string;
	amount: number;
	asset: string;
	tiles: [Tile, Tile];
	/** The big number is loading. */
	loading: boolean;
	/** The two tiles are loading (they come from a different request than the big number). Defaults to `loading`. */
	tilesLoading?: boolean;
	/** A button on the banner (Withdraw, Set up wallet…), or nothing. */
	action?: React.ReactNode;
}

/**
 * The balance banner with two summary tiles tucked under its bottom edge. The
 * eye hides the big number — only that, as in the mock. The big number is the
 * wallet's real USDC balance (`GET /wallet/me`); the two tiles are worked out
 * from the person's jobs (see `WalletView`) and labelled as what they are.
 */
function BalanceCard({ label, amount, asset, tiles, loading, tilesLoading = loading, action }: BalanceCardProps) {
	const [hidden, setHidden] = useState(false);

	return (
		<section aria-label="Balance" className="overflow-hidden rounded-3xl bg-[#f4f4ff]">
			<div className="flex flex-col gap-5 bg-primary-500 px-5 pt-6 pb-10 text-white lg:flex-row lg:items-start lg:justify-between lg:px-7.5 lg:pt-7 lg:pb-9">
				<div className="flex flex-col gap-2 lg:gap-3">
					<div className="flex items-center justify-between gap-6 lg:justify-start lg:gap-10">
						<p className="text-b1">{label}</p>
						<button
							type="button"
							onClick={() => setHidden((value) => !value)}
							aria-label={hidden ? "Show amount" : "Hide amount"}
							aria-pressed={hidden}
							className="flex size-8 items-center justify-center rounded-md outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white"
						>
							{hidden ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
						</button>
					</div>
					{loading ? (
						<Skeleton className="h-9 w-56 bg-white/25" />
					) : (
						<p className="text-h4 font-medium lg:text-h4 lg:font-medium" aria-live="polite">
							{hidden ? `•••••• ${asset}` : formatMoney(amount, asset)}
						</p>
					)}
				</div>
				{action}
			</div>

			<div className="-mt-5 rounded-t-3xl bg-[#f4f4ff] p-3 lg:p-5">
				<div className="grid grid-cols-2 gap-3 lg:gap-8">
					{tiles.map((tile) => (
						<TileView key={tile.label} tile={tile} asset={asset} loading={tilesLoading} />
					))}
				</div>
			</div>
		</section>
	);
}

export { BalanceCard };
export type { Tile };
