import type { Metadata } from "next";
import { WalletConnected } from "@/features/provider/components/WalletConnected";

export const metadata: Metadata = { title: "Wallet connected" };

export default function WalletConnectedPage() {
	return <WalletConnected />;
}
