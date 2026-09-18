"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "./lib/utils";

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
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

/**
 * `Dialog`'s own `mobileSheet` variant approximated a bottom sheet purely
 * with CSS on top of a plain Radix `Dialog` — a modal, not a drawer, with
 * none of a drawer's actual mobile-specific handling. Reported live
 * (screenshot: Chrome's own autofill bar visible, no keyboard, input
 * visibly focused but unresponsive) tracing back to exactly that gap —
 * `vaul` (what shadcn's own `Drawer` is actually built on) exists
 * specifically to handle a bottom sheet's real mobile interactions
 * (drag-to-dismiss, snap points, and repositioning the sheet around the
 * on-screen keyboard when a focused input would otherwise end up hidden
 * behind it) that a generic modal was never designed for. `ResponsiveDialog`
 * (see that file) is what call sites actually use — this only backs its
 * mobile half.
 *
 * No close-button prop — `DialogContent`'s own `mobileSheet` variant never
 * actually showed one on a real mobile viewport either (`hidden ...
 * sm:flex`, and this only ever renders below that breakpoint); the drag
 * handle is the sheet's own dismiss affordance, same as the mock.
 */
function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	return (
		<DrawerPortal>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				className={cn(
					"fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col gap-6 rounded-t-2xl bg-background p-5 pt-3 outline-none",
					className,
				)}
				{...props}
			>
				<span
					aria-hidden="true"
					className="mx-auto -mt-1 mb-1 h-1 w-9 shrink-0 rounded-full bg-neutral-200"
				/>
				<div className="flex flex-col gap-6 overflow-y-auto">{children}</div>
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="drawer-header" className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />
	);
}

function DrawerTitle({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn("text-s1 text-foreground text-center", className)}
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn("text-c1 text-muted-foreground text-center", className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerTrigger,
	DrawerPortal,
	DrawerClose,
	DrawerOverlay,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
};
