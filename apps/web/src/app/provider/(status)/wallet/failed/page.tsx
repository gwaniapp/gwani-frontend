import type { Metadata } from "next";
import { WalletFailed } from "@/features/provider/components/WalletFailed";

export const metadata: Metadata = { title: "Connection failed" };

export default function WalletFailedPage() {
	return <WalletFailed />;
}
