import { SAMPLE_PUBLIC_KEY } from "@/lib/wallet";

/**
 * Mock data for the dashboard's Wallet page. The backend has wallet balance
 * and transaction endpoints, but nothing here is wired to them yet. The design
 * shows the same figure in both summary tiles, so the second tile's meaning
 * ("Total Earned") and its number are my choice, not the mock's.
 */
export const MOCK_WALLET = {
	publicKey: SAMPLE_PUBLIC_KEY,
	asset: "USDC",
	balance: 1200,
	pendingEarnings: 15000,
	totalEarned: 48500,
};

export type WalletTransactionKind = "RECEIVED" | "WITHDRAWAL" | "FUNDED";
export type WalletTransactionStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface WalletTransaction {
	id: string;
	kind: WalletTransactionKind;
	title: string;
	/** ISO timestamp. */
	date: string;
	/** Signed: positive is money in, negative is money out. */
	amount: number;
	status: WalletTransactionStatus;
}

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
	{ id: "tx-1", kind: "RECEIVED", title: "Payment received for Kitchen Pipe Repair", date: "2026-08-20T10:26:00Z", amount: 500, status: "COMPLETED" },
	{ id: "tx-2", kind: "WITHDRAWAL", title: "Withdrawal to external wallet", date: "2026-08-19T15:04:00Z", amount: -500, status: "PENDING" },
	{ id: "tx-3", kind: "RECEIVED", title: "Received from John Doe", date: "2026-08-18T10:22:00Z", amount: 1000, status: "COMPLETED" },
	{ id: "tx-4", kind: "FUNDED", title: "Wallet Funded", date: "2026-08-12T09:10:00Z", amount: 1000, status: "COMPLETED" },
];
