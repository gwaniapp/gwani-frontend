import { create } from "zustand";

/** The (Chromium-only) event that lets a page open the browser's own "Install app" dialog. */
export interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallState {
	/** The browser's install prompt, kept from when it fired (it fires once, early — long before Settings is opened). */
	deferred: BeforeInstallPromptEvent | null;
	/** Gwani is already installed / is running as an installed app. */
	installed: boolean;
	set: (patch: Partial<Pick<InstallState, "deferred" | "installed">>) => void;
}

/** Where the "Download Gwani" state lives; filled in by `InstallPromptListener`. */
export const useInstallStore = create<InstallState>((set) => ({
	deferred: null,
	installed: false,
	set: (patch) => set(patch),
}));
