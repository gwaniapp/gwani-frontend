import { cn } from "@repo/ui/lib/utils";

interface FilterPillProps {
	/** Accessible name — the pill itself shows the chosen option, or `placeholder`. */
	label: string;
	/** What the empty option reads, e.g. "All Categories". */
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<{ value: string; label: string }>;
	/** Keep the highlighted look even with nothing chosen (the mock's "All Categories"). */
	alwaysActive?: boolean;
}

/**
 * A rounded filter chip that's really a native `<select>` sitting invisibly on
 * top of it — so it's the platform picker (best on phones), fully keyboard and
 * screen-reader accessible, with our chrome drawn underneath. Highlighted once
 * something is picked.
 */
function FilterPill({ label, placeholder, value, onChange, options, alwaysActive }: FilterPillProps) {
	const active = alwaysActive || value !== "";
	const shown = options.find((option) => option.value === value)?.label ?? placeholder;

	return (
		<label
			className={cn(
				"relative inline-flex h-10 max-w-full items-center gap-2.5 rounded-full border bg-white px-4 text-b3 transition-colors focus-within:ring-2 focus-within:ring-primary-200 md:h-11 md:px-5",
				active ? "border-primary-500 text-primary-500" : "border-neutral-300 text-neutral-500 hover:border-neutral-500",
			)}
		>
			<span className="sr-only">{label}</span>
			<span className="truncate" aria-hidden="true">
				{shown}
			</span>
			<svg viewBox="0 0 10 6" className="h-1.5 w-2.5 shrink-0 fill-current" aria-hidden="true">
				<path d="M0 0h10L5 6z" />
			</svg>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="absolute inset-0 size-full cursor-pointer opacity-0"
			>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}

export { FilterPill };
