"use client";

import { useEffect } from "react";
import { logAction } from "@/lib/logger";
import { useInstallStore, type BeforeInstallPromptEvent } from "@/lib/stores/installStore";

/** True when the page is running as an installed app (Android/desktop `display-mode`, or iOS's `navigator.standalone`). */
function isStandalone() {
	return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Renders nothing. Remembers the browser's `beforeinstallprompt` in `installStore` — it
 * fires once, so the root layout's early script catches it first and this component picks
 * that up on mount (and listens for a later one) — and notes when the app is installed
 * (`appinstalled`, or already running standalone).
 */
function InstallPromptListener() {
	useEffect(() => {
		const { set } = useInstallStore.getState();
		if (isStandalone()) set({ installed: true });
		// The early script in the root layout may already have caught the prompt, before this component mounted.
		const early = (window as Window & { __gwaniInstallPrompt?: BeforeInstallPromptEvent }).__gwaniInstallPrompt;
		if (early) set({ deferred: early });

		const onPrompt = (event: Event) => {
			event.preventDefault();
			set({ deferred: event as BeforeInstallPromptEvent });
			logAction("app.install-prompt", "info", { available: true });
		};
		const onInstalled = () => {
			set({ deferred: null, installed: true });
			logAction("app.install", "success");
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);

	return null;
}

export { InstallPromptListener };
