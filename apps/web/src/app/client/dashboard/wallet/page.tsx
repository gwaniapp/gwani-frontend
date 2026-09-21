import type { Metadata } from "next";
import { WalletView } from "@/features/dashboard/components/wallet/WalletView";

export const metadata: Metadata = { title: "Wallet" };

export default function ClientWalletPage() {
	return <WalletView role="client" />;
}
