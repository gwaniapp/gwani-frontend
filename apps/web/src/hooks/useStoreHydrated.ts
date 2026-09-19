import { useEffect, useSyncExternalStore } from "react";

interface PersistApi {
	hasHydrated: () => boolean;
	onFinishHydration: (listener: () => void) => () => void;
	rehydrate: () => unknown;
}

/**
 * For zustand stores created with `skipHydration`: loads what's in storage
 * after mount and reports when it has. `false` on the server and the first
 * client render, so nothing that depends on stored state paints a wrong value
 * first.
 */
function useStoreHydrated(persistApi: PersistApi) {
	useEffect(() => {
		void persistApi.rehydrate();
	}, [persistApi]);

	return useSyncExternalStore(
		(onChange) => persistApi.onFinishHydration(onChange),
		() => persistApi.hasHydrated(),
		() => false,
	);
}

export { useStoreHydrated };
