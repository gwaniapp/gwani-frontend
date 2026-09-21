import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * What the Connect Your Wallet screen chose, carried to the connecting /
 * connected / failed screens: `link` an existing wallet (the pasted public key)
 * or `generate` the platform's custodial one, plus the message to show if it
 * fails. Session-scoped, and `skipHydration` for the same reason as
 * `signUpFlowStore` (see `useStoreHydrated`).
 */
export type WalletMode = "link" | "generate";

interface WalletFlowState {
	mode: WalletMode;
	publicKey: string;
	/** Why the last attempt failed, for the failure screen. */
	error: string;
	start: (mode: WalletMode, publicKey?: string) => void;
	fail: (error: string) => void;
	reset: () => void;
}

const useWalletFlowStore = create<WalletFlowState>()(
	persist(
		(set) => ({
			mode: "generate",
			publicKey: "",
			error: "",
			start: (mode, publicKey = "") => set({ mode, publicKey, error: "" }),
			fail: (error) => set({ error }),
			reset: () => set({ mode: "generate", publicKey: "", error: "" }),
		}),
		{
			name: "gwani-wallet-flow",
			storage: createJSONStorage(() => sessionStorage),
			skipHydration: true,
		},
	),
);

export { useWalletFlowStore };
