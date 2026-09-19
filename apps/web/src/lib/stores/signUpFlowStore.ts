import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SignUpRole } from "@/lib/api/types";

/**
 * Transient state carried across the sign-up flow (Sign Up -> Verify OTP).
 * Session-scoped (not localStorage) — this shouldn't outlive the browser
 * tab, and shouldn't leak into a URL either.
 *
 * `skipHydration` keeps the first client render identical to the server's
 * (empty); consumers call `useSignUpFlowStore.persist.rehydrate()` in an
 * effect to load what's in sessionStorage.
 */
interface SignUpFlowState {
	/** Set at Sign Up — the OTP step verifies against this address. */
	email: string;
	setEmail: (email: string) => void;
	/** Chosen at Sign Up — decides where the flow continues after verification. */
	role: SignUpRole | null;
	setRole: (role: SignUpRole) => void;
	reset: () => void;
}

const useSignUpFlowStore = create<SignUpFlowState>()(
	persist(
		(set) => ({
			email: "",
			setEmail: (email) => set({ email }),
			role: null,
			setRole: (role) => set({ role }),
			reset: () => set({ email: "", role: null }),
		}),
		{
			name: "gwani-sign-up-flow",
			storage: createJSONStorage(() => sessionStorage),
			skipHydration: true,
		},
	),
);

export { useSignUpFlowStore };
