"use client";

import { toast as sonnerToast, Toaster as Sonner, type ToasterProps } from "sonner";

import { Alert, type AlertVariant } from "./alert";

/**
 * The toast content IS the `Alert` component (via `toast.custom`), not a
 * separate sonner-styled approximation of it — sonner's close button is
 * part of its own internal markup and can't be reliably reordered through
 * `classNames` alone, so re-implementing the same visual in two places
 * only guarantees they drift apart. This way they can't.
 */
function Toaster(props: ToasterProps) {
	return (
		<Sonner
			position="top-right"
			toastOptions={{ unstyled: true, classNames: { toast: "w-full" } }}
			{...props}
		/>
	);
}

function showAlertToast(variant: AlertVariant, message: string) {
	return sonnerToast.custom((id) => (
		<Alert
			variant={variant}
			onDismiss={() => sonnerToast.dismiss(id)}
			className="shadow-lg"
		>
			{message}
		</Alert>
	));
}

// Typed as `typeof sonnerToast` explicitly — otherwise TS tries to name the
// inferred intersection type, which references a type sonner doesn't export.
const toast: typeof sonnerToast = Object.assign(sonnerToast, {
	success: (message: string) => showAlertToast("success", message),
	error: (message: string) => showAlertToast("error", message),
	warning: (message: string) => showAlertToast("warning", message),
	info: (message: string) => showAlertToast("info", message),
});

export { Toaster, toast };
