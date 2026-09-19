import { WalletAddressCard } from "@/components/WalletAddressCard";
import { BalanceCard } from "@/features/dashboard/components/wallet/BalanceCard";
import { RecentTransactions } from "@/features/dashboard/components/wallet/RecentTransactions";
import { MOCK_WALLET } from "@/lib/mock/providerWallet";

/**
 * The provider's wallet: balance and pending/total earnings, the address (the
 * same card as on the profile and the wallet-connected screen), and recent
 * activity. Mock data (`lib/mock/providerWallet.ts`). The "Wallet" title is
 * visually hidden on phones, where the mock starts at the balance card.
 */
function WalletView() {
	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<h1 className="sr-only lg:not-sr-only lg:text-h2 lg:font-medium lg:text-foreground">Wallet</h1>
			<BalanceCard />
			<WalletAddressCard publicKey={MOCK_WALLET.publicKey} />
			<RecentTransactions />
		</div>
	);
}

export { WalletView };
