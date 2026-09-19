"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
	getCountries,
	getCountryCallingCode,
	type CountryCode,
} from "libphonenumber-js/min";

import { cn } from "./lib/utils";
import { COUNTRY_NAMES } from "./lib/country-names";
import { Input } from "./input";

/** Placeholder default market — swap once the target market is known. */
const DEFAULT_COUNTRY: CountryCode = "US";

/** ISO 3166-1 alpha-2 -> flag emoji, via the regional-indicator Unicode
 * trick (each letter maps to its own regional-indicator symbol; the pair
 * renders as that country's flag in every modern platform/browser). Pure
 * string arithmetic, not locale/ICU-dependent, so unlike a country's
 * display *name* this is safe to compute the same way on server and
 * client. */
function flagEmoji(iso2: string) {
	return String.fromCodePoint(
		...[...iso2.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)),
	);
}

/** Built once at module load, not per-render. Sorted by name (not calling
 * code) since that's how someone actually finds their country in a
 * 245-entry list — also why each option's text leads with the name: native
 * `<select>` jump-to-letter search matches an option's own text from its
 * first character, and a leading flag emoji would break that. */
const COUNTRIES = getCountries()
	.map((iso2) => ({
		iso2,
		callingCode: getCountryCallingCode(iso2),
		name: COUNTRY_NAMES[iso2] ?? iso2,
		flag: flagEmoji(iso2),
	}))
	// Plain lexicographic comparison, not `localeCompare` — the latter's
	// collation can differ between Node's ICU (SSR) and a browser's
	// (hydration), which would reorder this list between the two and
	// produce the exact same class of mismatch the names themselves had.
	.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const COUNTRY_BY_CODE = new Map(
	COUNTRIES.map((country) => [country.iso2, country]),
);

interface PhoneInputProps extends Omit<
	React.ComponentProps<"input">,
	"value" | "onChange" | "type"
> {
	/** Full phone value, e.g. "+233 24 123 4567" — combined country code +
	 * national number, same shape regardless of which country is selected. */
	value: string;
	onChange: (value: string) => void;
}

/**
 * Any country, not just Ghana — a country select (searchable by typing a
 * country's name, native `<select>` behavior) paired with the national
 * number field. `value`/`onChange` keep the same combined-string shape
 * every caller already expects; which country is currently selected is
 * this component's own local state; a caller only ever sees the result.
 */
function PhoneInput({
	value,
	onChange,
	className,
	disabled,
	id,
	placeholder = "Phone number",
	...props
}: PhoneInputProps) {
	// Infer the selected country from an incoming value (e.g. editing an
	// already-filled field) by matching the longest calling-code prefix —
	// falls back to DEFAULT_COUNTRY when nothing matches (including the
	// common case of starting from an empty value).
	const inferCountry = React.useCallback((phoneValue: string): CountryCode => {
		if (!phoneValue.startsWith("+")) return DEFAULT_COUNTRY;
		const digits = phoneValue.slice(1);
		let best: CountryCode | null = null;
		for (const country of COUNTRIES) {
			if (digits.startsWith(country.callingCode)) {
				if (
					!best ||
					country.callingCode.length > getCountryCallingCode(best).length
				) {
					best = country.iso2;
				}
			}
		}
		return best ?? DEFAULT_COUNTRY;
	}, []);

	const [country, setCountry] = React.useState<CountryCode>(() =>
		inferCountry(value),
	);
	const selected =
		COUNTRY_BY_CODE.get(country) ?? COUNTRY_BY_CODE.get(DEFAULT_COUNTRY)!;

	const national = value.startsWith(`+${selected.callingCode}`)
		? value.slice(selected.callingCode.length + 1).trim()
		: value.replace(/^\+\d+\s*/, "");

	function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const nextCountry = e.target.value as CountryCode;
		setCountry(nextCountry);
		const nextCallingCode = getCountryCallingCode(nextCountry);
		onChange(national ? `+${nextCallingCode} ${national}` : "");
	}

	function handleDigitsChange(e: React.ChangeEvent<HTMLInputElement>) {
		// Sanitize as-you-type: digits only, drop a leading trunk "0" (e.g. a
		// national "024..." typed with its trunk prefix, which the country
		// code already replaces), capped at 14 digits — E.164's max total
		// length (15) minus at least 1 digit of calling code.
		const digits = e.target.value
			.replace(/\D/g, "")
			.replace(/^0+/, "")
			.slice(0, 14);
		onChange(digits ? `+${selected.callingCode} ${digits}` : "");
	}

	return (
		<div className={cn("flex gap-2", className)}>
			{/* The real `<select>` stays fully functional — native dropdown,
			    keyboard/typeahead search matching each option's own (name-first)
			    text — but its own rendered value is transparent. A decorative
			    flag+code label overlays it for the closed control, matching the
			    mock's compact trigger; a plain select can't show short text
			    closed and long, searchable text open at the same time since its
			    closed state always mirrors the selected option's own text. */}
			<div className="relative shrink-0">
				<select
					aria-label="Country code"
					value={country}
					onChange={handleCountryChange}
					disabled={disabled}
					className={cn(
						"h-11 w-28 cursor-pointer appearance-none rounded-lg border border-input bg-background pr-8 pl-3 text-transparent shadow-xs transition-colors outline-none",
						"focus-visible:border-primary",
						"disabled:cursor-not-allowed disabled:opacity-100 disabled:border-muted disabled:bg-muted",
					)}
				>
					{COUNTRIES.map((c) => (
						<option className="text-black" key={c.iso2} value={c.iso2}>
							{c.name} +{c.callingCode} {c.flag}
						</option>
					))}
				</select>
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-y-0 left-3 flex items-center gap-1.5 text-b1 text-foreground",
						disabled && "opacity-50",
					)}
				>
					<span>{selected.flag}</span>
					<span>+{selected.callingCode}</span>
				</div>
				<ChevronDown
					className="pointer-events-none absolute inset-y-0 right-2.5 my-auto size-4 text-muted-foreground"
					aria-hidden="true"
				/>
			</div>
			<Input
				id={id}
				type="tel"
				inputMode="numeric"
				autoComplete="tel-national"
				placeholder={placeholder}
				value={national}
				disabled={disabled}
				onChange={handleDigitsChange}
				{...props}
			/>
		</div>
	);
}

export { PhoneInput };
export type { PhoneInputProps };
