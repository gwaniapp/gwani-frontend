"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "./lib/utils";

interface TagInputProps
	extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type" | "className"> {
	value: string[];
	onChange: (value: string[]) => void;
	/** Options offered in a dropdown as you focus/type; picking one adds it. Anything typed can still be added. */
	suggestions?: string[];
	/** Most tags allowed; the field stops accepting more once reached. */
	maxTags?: number;
	/** Extra classes for the field box. */
	className?: string;
}

/**
 * A multi-value field like the recipients box in an email app: tags sit inside
 * the field as removable pills, followed by the text cursor. Enter or a comma
 * turns what you typed into a pill (so does leaving the field), Backspace on an
 * empty field removes the last pill, and — with `suggestions` — a dropdown lets
 * you pick from a list (arrow keys + Enter, or click). Duplicates (ignoring
 * case) are dropped. Extra props (id, name, aria-*) land on the inner input, so
 * it works inside `FormControl`.
 */
function TagInput({
	value,
	onChange,
	suggestions = [],
	maxTags = 15,
	placeholder,
	disabled,
	className,
	onFocus,
	onBlur,
	onKeyDown,
	...props
}: TagInputProps) {
	const listId = React.useId();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [draft, setDraft] = React.useState("");
	const [open, setOpen] = React.useState(false);
	const [active, setActive] = React.useState(-1);

	const atLimit = value.length >= maxTags;
	const has = (tag: string) => value.some((existing) => existing.toLowerCase() === tag.toLowerCase());
	const query = draft.trim().toLowerCase();
	const options = suggestions
		.filter((suggestion) => !has(suggestion) && (!query || suggestion.toLowerCase().includes(query)))
		.slice(0, 50);
	const showList = open && options.length > 0;

	function commit(raw: string) {
		const tag = raw.trim();
		setDraft("");
		setActive(-1);
		if (!tag || atLimit || has(tag)) return;
		onChange([...value, tag]);
	}

	function handleChange(next: string) {
		setOpen(true);
		setActive(-1);
		// A typed or pasted comma ends the current tag(s), like separating recipients.
		if (next.includes(",")) {
			const parts = next.split(",");
			const pending = parts.pop() ?? "";
			const additions: string[] = [];
			for (const part of parts) {
				const tag = part.trim();
				if (!tag || has(tag) || additions.some((added) => added.toLowerCase() === tag.toLowerCase())) continue;
				additions.push(tag);
			}
			const room = Math.max(0, maxTags - value.length);
			if (additions.length) onChange([...value, ...additions.slice(0, room)]);
			setDraft(pending);
			return;
		}
		setDraft(next);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;

		if (e.key === "Enter") {
			e.preventDefault();
			const picked = showList ? options[active] : undefined;
			commit(picked ?? draft);
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setOpen(true);
			setActive((index) => Math.min(index + 1, options.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive((index) => Math.max(index - 1, -1));
		} else if (e.key === "Escape") {
			setOpen(false);
			setActive(-1);
		} else if (e.key === "Backspace" && draft === "" && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	}

	return (
		<div className="relative">
			{/* Clicking the box's padding should still focus the field. */}
			<div
				onClick={() => inputRef.current?.focus()}
				className={cn(
					"flex min-h-11 w-full cursor-text flex-wrap items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-1.5 shadow-xs transition-colors md:min-h-15.5 md:px-3.5",
					"has-[input:focus-visible]:border-primary has-[input[aria-invalid=true]]:border-destructive",
					disabled && "cursor-not-allowed border-muted bg-muted",
					className,
				)}
			>
				{value.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/50 py-1 pr-1.5 pl-3.5 text-b4 text-primary-600"
					>
						{tag}
						<button
							type="button"
							onClick={() => onChange(value.filter((existing) => existing !== tag))}
							disabled={disabled}
							aria-label={`Remove ${tag}`}
							className="flex size-5 items-center justify-center rounded-full outline-none transition-colors hover:bg-primary-200/60 focus-visible:ring-2 focus-visible:ring-primary-300"
						>
							<X className="size-3.5" aria-hidden="true" />
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					type="text"
					role="combobox"
					aria-expanded={showList}
					aria-controls={listId}
					aria-autocomplete="list"
					aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
					autoComplete="off"
					value={draft}
					disabled={disabled || atLimit}
					placeholder={value.length ? undefined : placeholder}
					data-slot="tag-input"
					className="min-w-24 flex-1 bg-transparent py-1.5 text-b1 text-foreground outline-none placeholder:text-b2 placeholder:text-neutral-300"
					onChange={(e) => handleChange(e.target.value)}
					onKeyDown={handleKeyDown}
					onFocus={(e) => {
						setOpen(true);
						onFocus?.(e);
					}}
					onBlur={(e) => {
						commit(draft);
						setOpen(false);
						onBlur?.(e);
					}}
					{...props}
				/>
			</div>

			{showList && (
				// mouse-down is swallowed so picking an option never blurs the field first.
				<ul
					id={listId}
					role="listbox"
					onMouseDown={(e) => e.preventDefault()}
					className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border bg-white p-1 shadow-lg"
				>
					{options.map((option, index) => (
						<li
							key={option}
							id={`${listId}-${index}`}
							role="option"
							aria-selected={index === active}
							onMouseEnter={() => setActive(index)}
							onClick={() => commit(option)}
							className="cursor-pointer rounded-lg px-3 py-2 text-b3 text-foreground aria-selected:bg-primary-100/50"
						>
							{option}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export { TagInput };
export type { TagInputProps };
