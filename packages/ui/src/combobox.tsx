"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "./input";
import { cn } from "./lib/utils";

interface ComboboxOption {
	value: string;
	/** What's shown in the field once picked, and what typing matches first. */
	label: string;
	/** A muted second line in the list; typing matches it too (e.g. a trade and a place). */
	description?: string;
}

interface ComboboxProps extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> {
	/** The picked option's `value`, or "" for none. */
	value: string;
	onChange: (value: string) => void;
	options: ComboboxOption[];
	/** Shown in the list when nothing matches what's typed. */
	emptyText?: string;
	/** Extra classes for the input (heights, font sizes) — same ones you'd give `Input`/`Select`. */
	className?: string;
}

const norm = (text: string) => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * A single-choice field you can either open like a `Select` or type into to
 * narrow a long list — for lists where scrolling for a name is slow. Typing
 * filters by every word you typed, against the label and description (accents
 * and case ignored); arrows move, Enter picks, Escape closes. Only picking
 * changes the value: leaving the field with half-typed text puts the picked
 * option's label back (or empties the field if nothing is picked), so the form
 * can never hold text that isn't one of the options. Works inside `FormControl`
 * (it forwards `id` and the `aria-*` props to the input).
 */
function Combobox({ value, onChange, options, emptyText = "No matches.", className, disabled, placeholder, onBlur, onFocus, ...props }: ComboboxProps) {
	const listId = React.useId();
	const rootRef = React.useRef<HTMLDivElement>(null);
	// `null` = not editing: the field shows the picked option's label.
	const [query, setQuery] = React.useState<string | null>(null);
	const [open, setOpen] = React.useState(false);
	const [active, setActive] = React.useState(0);

	const selected = options.find((option) => option.value === value);
	const words = norm(query ?? "").split(/\s+/).filter(Boolean);
	const shown = words.length
		? options.filter((option) => {
				const haystack = norm(`${option.label} ${option.description ?? ""}`);
				return words.every((word) => haystack.includes(word));
			})
		: options;
	const current = Math.min(active, Math.max(shown.length - 1, 0));

	function pick(option: ComboboxOption) {
		onChange(option.value);
		setQuery(null);
		setOpen(false);
	}

	function close() {
		setOpen(false);
		setQuery(null);
	}

	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!open) {
				setOpen(true);
				return;
			}
			if (shown.length === 0) return;
			const step = event.key === "ArrowDown" ? 1 : -1;
			setActive((current + step + shown.length) % shown.length);
		} else if (event.key === "Enter") {
			// Enter inside a form would submit it; here it picks.
			if (open) {
				event.preventDefault();
				const option = shown[current];
				if (option) pick(option);
			}
		} else if (event.key === "Escape") {
			if (open) {
				event.preventDefault();
				close();
			}
		}
	}

	return (
		<div
			ref={rootRef}
			className="relative"
			onBlur={(event) => {
				if (!rootRef.current?.contains(event.relatedTarget)) close();
			}}
		>
			<Input
				{...props}
				type="text"
				role="combobox"
				aria-expanded={open}
				aria-controls={listId}
				aria-autocomplete="list"
				aria-activedescendant={open && shown[current] ? `${listId}-${current}` : undefined}
				autoComplete="off"
				disabled={disabled}
				placeholder={placeholder}
				value={query ?? selected?.label ?? ""}
				onChange={(event) => {
					setQuery(event.target.value);
					setActive(0);
					setOpen(true);
				}}
				onFocus={(event) => {
					setOpen(true);
					event.target.select();
					onFocus?.(event);
				}}
				onClick={() => setOpen(true)}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				className={cn("pr-10", className)}
			/>
			<ChevronDown
				className={cn("pointer-events-none absolute inset-y-0 right-3.5 my-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")}
				aria-hidden="true"
			/>

			{open && !disabled && (
				// mouse-down is swallowed so picking an option never blurs the field first.
				<ul
					id={listId}
					role="listbox"
					onMouseDown={(event) => event.preventDefault()}
					className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-lg"
				>
					{shown.map((option, index) => (
						<li
							key={option.value}
							id={`${listId}-${index}`}
							role="option"
							aria-selected={index === current}
							data-picked={option.value === value ? "" : undefined}
							onMouseEnter={() => setActive(index)}
							onClick={() => pick(option)}
							className="cursor-pointer rounded-lg px-3 py-2 text-b3 text-foreground aria-selected:bg-primary-100/50 data-picked:font-medium"
						>
							<span className="block truncate">{option.label}</span>
							{option.description && <span className="block truncate text-c1 font-normal text-neutral-500">{option.description}</span>}
						</li>
					))}
					{shown.length === 0 && (
						<li role="presentation" className="px-3 py-2 text-b3 text-neutral-500">
							{emptyText}
						</li>
					)}
				</ul>
			)}
		</div>
	);
}

export { Combobox };
export type { ComboboxOption, ComboboxProps };
