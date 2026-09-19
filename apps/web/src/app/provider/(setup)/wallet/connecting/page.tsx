import type { Metadata } from "next";
import { WalletConnecting } from "@/features/provider/components/WalletConnecting";

export const metadata: Metadata = { title: "Connecting your wallet" };

export default function WalletConnectingPage() {
	return <WalletConnecting />;
}
