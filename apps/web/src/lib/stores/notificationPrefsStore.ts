import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * STAND-IN for notification preferences: the backend has no endpoint for them
 * yet, so the switches on the Settings page are remembered in this browser
 * only. When one exists, replace this with a query + mutation and keep the
 * ids (see `NOTIFICATION_OPTIONS`) as the keys.
 *
 * `skipHydration` like the other persisted stores — the settings screen
 * rehydrates in an effect (`useStoreHydrated`) so the first client render
 * matches the server's.
 */
interface NotificationPrefsState {
	/** Only ids the person has changed; anything absent uses its default. */
	overrides: Record<string, boolean>;
	set: (id: string, enabled: boolean) => void;
}

const useNotificationPrefsStore = create<NotificationPrefsState>()(
	persist(
		(set) => ({
			overrides: {},
			set: (id, enabled) => set((state) => ({ overrides: { ...state.overrides, [id]: enabled } })),
		}),
		{
			name: "gwani-mock-notification-prefs",
			storage: createJSONStorage(() => localStorage),
			skipHydration: true,
		},
	),
);

export { useNotificationPrefsStore };
