"use client";

import { useState } from "react";
import { CircleCheck, Download } from "lucide-react";
import { Button } from "@repo/ui/button";
import { logAction } from "@/lib/logger";
import { useInstallStore } from "@/lib/stores/installStore";

/** Which "add to home screen" steps to show when the browser has no install prompt to trigger. */
function manualSteps(): string {
	if (typeof navigator === "undefined") return "Open your browser's menu and choose “Install Gwani” or “Add to Home Screen”.";
	const ua = navigator.userAgent;
	if (/iPhone|iPad|iPod/.test(ua)) return "Tap the Share button in Safari, then “Add to Home Screen”.";
	if (/Firefox/.test(ua) && /Android/.test(ua)) return "Open the browser menu (⋮), then tap “Install”.";
	if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return "In Safari, choose File ▸ Add to Dock (or use Share ▸ Add to Home Screen on iPhone).";
	return "Open your browser's menu and choose “Install Gwani” or “Add to Home Screen”. (Firefox on desktop can't install web apps.)";
}

/**
 * "Download Gwani": installs the web app on this device, so it opens in its own
 * window / from the home screen like an app. Where the browser offers it
 * (Chrome, Edge, Samsung Internet — via `beforeinstallprompt`, caught early by
 * `InstallPromptListener`) the button opens the browser's own install dialog;
 * everywhere else (iPhone, Safari, Firefox) it shows the steps to do it by hand.
 * There is no app-store listing, so this is the only kind of download.
 */
function DownloadApp({ onDone }: { onDone?: () => void }) {
	const deferred = useInstallStore((state) => state.deferred);
	const installed = useInstallStore((state) => state.installed);
	const [busy, setBusy] = useState(false);

	async function install() {
		if (!deferred) return;
		setBusy(true);
		logAction("app.install", "start");
		try {
			await deferred.prompt();
			const { outcome } = await deferred.userChoice;
			logAction("app.install", outcome === "accepted" ? "success" : "info", { outcome });
			// The prompt can only be used once; a dismissed one is gone until the browser offers it again.
			useInstallStore.getState().set({ deferred: null, ...(outcome === "accepted" ? { installed: true } : {}) });
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex flex-col gap-5">
			<p className="text-b3 text-neutral-500 sm:text-b1">
				Install Gwani on this device to open it in its own window, straight from your home screen or desktop, without opening the browser first.
			</p>

			{installed ? (
				<p role="status" className="flex items-center gap-2.5 rounded-xl bg-success-100 px-4 py-3 text-b3 text-[#0a7b4e] sm:text-b1">
					<CircleCheck className="size-5 shrink-0" aria-hidden="true" />
					Gwani is installed on this device.
				</p>
			) : deferred ? (
				<Button type="button" size="giant" loading={busy} onClick={() => void install()} className="h-12 w-full rounded-xl sm:w-auto sm:px-10">
					<Download className="size-5" aria-hidden="true" />
					Download Gwani
				</Button>
			) : (
				<div className="flex flex-col gap-2 rounded-xl bg-muted px-4 py-3 text-b3 text-foreground sm:text-b1">
					<p className="font-medium">To install it on this device</p>
					<p className="text-neutral-600">{manualSteps()}</p>
				</div>
			)}

			{onDone && (
				<Button type="button" variant="outline" size="giant" onClick={onDone} className="h-12 w-full rounded-xl border-neutral-300 text-neutral-600">
					Close
				</Button>
			)}
		</div>
	);
}

export { DownloadApp };
