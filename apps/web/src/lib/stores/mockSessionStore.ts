import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserRole } from "@/lib/api/types";

/**
 * STAND-IN for a real session while auth is mocked: the mock sign-in and OTP
 * steps issue no tokens, so nothing else says who is signed in or as what.
 * This remembers just the role so `/` can send people to the right dashboard.
 * When auth goes live, delete this and read the role from the session
 * (`user.role` on the login/verify response, or `GET /users/me` via
 * `useSession`); the callers are marked.
 *
 * `skipHydration` like the other persisted stores — consumers rehydrate in an
 * effect (`useStoreHydrated`) so the first client render matches the server's.
 */
interface MockSessionState {
	role: UserRole | null;
	setRole: (role: UserRole) => void;
	clear: () => void;
}

const useMockSessionStore = create<MockSessionState>()(
	persist(
		(set) => ({
			role: null,
			setRole: (role) => set({ role }),
			clear: () => set({ role: null }),
		}),
		{
			name: "gwani-mock-session",
			storage: createJSONStorage(() => localStorage),
			skipHydration: true,
		},
	),
);

export { useMockSessionStore };
