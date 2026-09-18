"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";

import { cn } from "./lib/utils";

const Accordion = AccordionPrimitive.Root;

function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn("border-b border-border last:border-b-0", className)}
			{...props}
		/>
	);
}

/** Plus/minus toggle (not a chevron) — matches the Figma FAQ spec, which
 * swaps a "plus-large"/"minus" glyph rather than rotating a chevron. Both
 * icons are always mounted and cross-faded via the trigger's own
 * `data-state`, so there's no dependent-state juggling in the component. */
function AccordionTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className={cn(
					"group flex flex-1 items-center justify-between gap-4 py-5 text-left text-s2 text-foreground outline-none transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-200 disabled:pointer-events-none disabled:opacity-50",
					className,
				)}
				{...props}
			>
				{children}
				<span className="relative size-5 shrink-0 text-muted-foreground">
					<Plus className="absolute inset-0 size-5 transition-opacity group-data-[state=open]:opacity-0" aria-hidden="true" />
					<Minus className="absolute inset-0 size-5 opacity-0 transition-opacity group-data-[state=open]:opacity-100" aria-hidden="true" />
				</span>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

function AccordionContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			className="overflow-hidden text-b3 text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
			{...props}
		>
			<div className={cn("pb-5", className)}>{children}</div>
		</AccordionPrimitive.Content>
	);
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
