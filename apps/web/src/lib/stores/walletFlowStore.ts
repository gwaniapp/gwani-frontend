import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The wallet chosen on the Connect Your Wallet screen, carried to the
 * connecting/connected screens. Session-scoped, and `skipHydration` for the
 * same reason as `signUpFlowStore` (see `useStoreHydrated`).
 */
interface WalletFlowState {
	publicKey: string;
	setPublicKey: (publicKey: string) => void;
	reset: () => void;
}

const useWalletFlowStore = create<WalletFlowState>()(
	persist(
		(set) => ({
			publicKey: "",
			setPublicKey: (publicKey) => set({ publicKey }),
			reset: () => set({ publicKey: "" }),
		}),
		{
			name: "gwani-wallet-flow",
			storage: createJSONStorage(() => sessionStorage),
			skipHydration: true,
		},
	),
);

export { useWalletFlowStore };
