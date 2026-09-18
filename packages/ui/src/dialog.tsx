"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "./lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-neutral-900/50",
				"data-[state=open]:animate-in data-[state=open]:fade-in-0",
				"data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
				className,
			)}
			{...props}
		/>
	);
}

interface DialogContentProps
	extends React.ComponentProps<typeof DialogPrimitive.Content> {
	/** Set false for a step (e.g. a success screen) that shouldn't offer an
	 * easy way to dismiss it accidentally. */
	showCloseButton?: boolean;
	/** Below `sm`, anchor to the bottom edge with a slide-up entrance and a
	 * drag-handle bar instead of the default centered/zoomed dialog — the
	 * bottom-sheet treatment several mobile mocks use for a modal-editing
	 * flow (e.g. Personal Information, Change PIN/Password) that's a plain
	 * centered dialog on desktop. `sm` and up are completely unaffected —
	 * same centered treatment as always.
	 *
	 * Prefer `ResponsiveDialogContent` (`./responsive-dialog`) over setting
	 * this directly for a new modal-on-desktop/drawer-on-mobile flow — it
	 * renders a real `Drawer` (`vaul`) below `sm` instead of this CSS-only
	 * approximation, which was never built for a bottom sheet's actual
	 * mobile interactions (see that file's own note). This prop still
	 * exists because `ResponsiveDialogContent` uses it internally for its
	 * *desktop* half (`sm` and up, where this component's own mobile-only
	 * CSS/behavior never actually renders). */
	mobileSheet?: boolean;
}

/** Centered, scroll-safe on short viewports, and capped to the viewport
 * width (minus a consistent gutter) rather than just a fixed max-width, so
 * it doesn't overflow on narrow screens before the page-based mobile flow
 * replaces it there. */
function DialogContent({
	className,
	children,
	showCloseButton = true,
	mobileSheet = false,
	onOpenAutoFocus,
	...props
}: DialogContentProps) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				onOpenAutoFocus={(event) => {
					// Radix focuses the first focusable descendant (often a text/OTP
					// input) the instant this mounts. For a `mobileSheet` that's
					// still mid slide-up-from-bottom animation at that point — on
					// mobile Safari/Chrome, a programmatic `.focus()` call that
					// isn't the *direct, synchronous* result of the tap that opened
					// the dialog no longer counts as a user gesture, so the on-screen
					// keyboard never appears even though the input visibly has focus
					// (reported live: "my keyboard is not coming out for all the
					// drawers"). Skipping auto-focus below `sm` — real bottom-sheet
					// territory — lets the person's own tap on the field do it
					// instead, which is always a genuine gesture and always brings
					// the keyboard up. `sm` and up (where this same content also
					// renders as a plain centered dialog, no animation-timing issue,
					// and a physical keyboard is the norm) keeps Radix's default.
					if (mobileSheet && typeof window !== "undefined" && window.innerWidth < 640) {
						event.preventDefault();
					}
					onOpenAutoFocus?.(event);
				}}
				className={cn(
					"fixed z-50 grid gap-6 overflow-y-auto bg-background outline-none",
					mobileSheet
						? cn(
								"inset-x-0 bottom-0 top-auto max-h-[90vh] w-full translate-x-0 translate-y-0 rounded-t-2xl p-5 pt-3 shadow-lg",
								"data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom",
								"data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
								"sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-8",
								"sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:slide-in-from-bottom-0",
								"sm:data-[state=closed]:zoom-out-95 sm:data-[state=closed]:slide-out-to-bottom-0",
							)
						: cn(
								"top-1/2 left-1/2 max-h-[85vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl p-5 shadow-lg sm:max-w-xl sm:p-8",
								"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
								"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
							),
					className,
				)}
				{...props}
			>
				{mobileSheet && (
					<span
						aria-hidden="true"
						className="mx-auto -mt-1 mb-1 h-1 w-9 shrink-0 rounded-full bg-neutral-200 sm:hidden"
					/>
				)}
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close
						className={cn(
							"absolute items-center justify-center rounded-lg border border-border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary-200",
							// The mobile-sheet mocks use the drag handle (above) as the
							// only dismiss affordance below `sm` — an X floating over a
							// bottom sheet's own rounded top edge reads oddly next to it.
							mobileSheet
								? "hidden size-9 sm:top-6 sm:right-6 sm:flex"
								: "flex size-9 top-4 right-4 sm:top-6 sm:right-6",
						)}
						aria-label="Close"
					>
						<X className="size-4" aria-hidden="true" />
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-1.5 pr-8", className)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn("text-s1 text-foreground sm:text-h5", className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn("text-c1 text-muted-foreground sm:text-b3", className)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn("flex flex-col gap-3", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogClose,
	DialogOverlay,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
};
