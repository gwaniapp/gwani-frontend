import type { Metadata } from "next";
import { ConnectWalletForm } from "@/features/provider/components/ConnectWalletForm";

export const metadata: Metadata = { title: "Connect your wallet" };

export default function ConnectWalletPage() {
	return <ConnectWalletForm />;
}
