"use client";

import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/dialog";

/**
 * The console's dialog frame (same look as the Gwani app's job dialogs): a bordered header with the
 * title, one line of explanation and a square close button, then a scrolling body. `blockDismiss`
 * stops Esc / outside-click while a request runs, so nobody is left guessing whether it went through.
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
				className="max-h-[92dvh] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl sm:p-0"
				onInteractOutside={(event) => blockDismiss && event.preventDefault()}
				onEscapeKeyDown={(event) => blockDismiss && event.preventDefault()}
			>
				<DialogHeader className="flex-row items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-8 sm:py-6">
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
				<div className="max-h-[calc(92dvh-6rem)] overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">{children}</div>
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
