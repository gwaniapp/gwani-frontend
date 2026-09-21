"use client";

import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/dialog";

/**
 * The console's dialog frame. **Phones:** a bottom sheet — pinned to the bottom edge at full width,
 * sliding up, rounded on top only, with a drag-handle bar. **From `sm`:** a centred modal. Either way the
 * frame is capped to the viewport (`dvh`, so mobile browser chrome doesn't hide the bottom), the header
 * stays put and only the body scrolls — a tall dialog (a job with a long history) or a short screen
 * (landscape phone) never pushes the buttons out of reach. `blockDismiss` stops Esc / outside-click
 * while a request runs, so nobody is left guessing whether it went through.
 */
function AdminDialog({
	open,
	onOpenChange,
	title,
	description,
	blockDismiss,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: React.ReactNode;
	description: string;
	blockDismiss?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className={[
					"flex max-h-[92dvh] w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:p-0",
					// phones: bottom sheet
					"max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-3xl max-sm:rounded-b-none",
					"max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:zoom-out-100 max-sm:data-[state=closed]:slide-out-to-bottom",
					// sm and up: centred modal
					"sm:max-h-[88dvh] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:rounded-3xl",
				].join(" ")}
				onInteractOutside={(event) => blockDismiss && event.preventDefault()}
				onEscapeKeyDown={(event) => blockDismiss && event.preventDefault()}
			>
				<span aria-hidden="true" className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-neutral-200 sm:hidden" />
				<DialogHeader className="flex-row items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-8 sm:py-6">
					<div className="flex min-w-0 flex-col gap-1.5">
						<DialogTitle className="text-xl font-medium break-words sm:text-xl sm:font-medium">{title}</DialogTitle>
						<DialogDescription className="text-b3 break-words sm:text-b2">{description}</DialogDescription>
					</div>
					<DialogClose
						aria-label="Close"
						className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-neutral-600 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-200 sm:size-10 sm:rounded-xl"
					>
						<X className="size-5" aria-hidden="true" />
					</DialogClose>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-7">{children}</div>
			</DialogContent>
		</Dialog>
	);
}

/** A label/value row for a dialog's details list. */
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-0.5 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-4">
			<dt className="text-c1 text-neutral-500 sm:pt-0.5 sm:text-b3">{label}</dt>
			<dd className="min-w-0 text-b3 break-words text-foreground lg:text-b1">{children}</dd>
		</div>
	);
}

export { AdminDialog, Detail };
