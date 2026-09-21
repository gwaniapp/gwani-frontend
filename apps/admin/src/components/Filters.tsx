"use client";

import { Search } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Select } from "@repo/ui/select";

/** A labelled native select for a filter bar: the first option is "all" (empty value). */
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) {
	return (
		<label className="flex min-w-40 flex-col gap-1.5">
			<span className="text-c1 text-neutral-600">{label}</span>
			<Select value={value} onChange={(event) => onChange(event.target.value)} className="h-11">
				<option value="">{allLabel}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value} className="text-foreground">
						{option.label}
					</option>
				))}
			</Select>
		</label>
	);
}

/** A search box for a filter bar. */
function SearchBox({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
	return (
		<label className="relative flex min-w-56 flex-1 flex-col gap-1.5">
			<span className="text-c1 text-neutral-600">{label}</span>
			<span className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
				<Input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={100} className="h-11 pl-10" />
			</span>
		</label>
	);
}

export { FilterSelect, SearchBox };
