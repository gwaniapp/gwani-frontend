"use client";

import * as React from "react";

import { cn } from "./lib/utils";
import { Select } from "./select";

const MONTHS = [
	{ value: "01", label: "Jan" },
	{ value: "02", label: "Feb" },
	{ value: "03", label: "Mar" },
	{ value: "04", label: "Apr" },
	{ value: "05", label: "May" },
	{ value: "06", label: "Jun" },
	{ value: "07", label: "Jul" },
	{ value: "08", label: "Aug" },
	{ value: "09", label: "Sep" },
	{ value: "10", label: "Oct" },
	{ value: "11", label: "Nov" },
	{ value: "12", label: "Dec" },
];

function daysInMonth(year: number, month: number) {
	return new Date(year, month, 0).getDate();
}

function parseIsoDate(value: string) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match || !match[1] || !match[2] || !match[3]) return null;
	return { year: match[1], month: match[2], day: match[3] };
}

interface DateOfBirthInputProps {
	/** `""` or an ISO `YYYY-MM-DD` date — same shape a native
	 * `<input type="date">` field would carry, so callers (validation,
	 * the review summary) don't need to change either. */
	value: string;
	onChange: (value: string) => void;
	onBlur?: React.FocusEventHandler<HTMLSelectElement>;
	name?: string;
	id?: string;
	disabled?: boolean;
	className?: string;
	"aria-invalid"?: boolean | "true" | "false";
	"aria-describedby"?: string;
	/** Oldest selectable year. Defaults to 100 years ago. */
	minYear?: number;
	/** Newest selectable year. Defaults to 16 years ago. */
	maxYear?: number;
}

/**
 * Three plain `<select>`s (Day / Month / Year) instead of a native
 * `<input type="date">`. The native control's calendar-icon chrome has a
 * platform-enforced minimum width that doesn't shrink below roughly 220px
 * on iOS/Android — inside a narrow mobile form column that overflows the
 * page rather than wrapping. A day/month/year picker also matches how
 * someone actually enters a birth date (jump straight to a year decades
 * back) better than scrolling a calendar grid ever would.
 *
 * `value`/`onChange` keep the same `"YYYY-MM-DD"` string shape a native
 * date input already had, so `personalDetailsSchema`/`ReviewForm` needed no
 * changes. Each select is independently choosable — the combined value only
 * reaches `onChange` once all three are set, and the day list re-clamps
 * itself (e.g. 31 -> 28) when switching to a shorter month/leap year.
 */
function DateOfBirthInput({
	value,
	onChange,
	onBlur,
	name,
	id,
	disabled,
	className,
	minYear,
	maxYear,
	...ariaProps
}: DateOfBirthInputProps) {
	const currentYear = new Date().getFullYear();
	const oldestYear = minYear ?? currentYear - 100;
	const newestYear = maxYear ?? currentYear - 16;

	const parsed = parseIsoDate(value);
	const [day, setDay] = React.useState(parsed?.day ?? "");
	const [month, setMonth] = React.useState(parsed?.month ?? "");
	const [year, setYear] = React.useState(parsed?.year ?? "");
	const lastEmitted = React.useRef(value);

	// Re-sync from an externally-set value (e.g. navigating back to this
	// step with a value already in the store) without fighting the user's
	// own in-progress, still-incomplete selection the rest of the time.
	React.useEffect(() => {
		if (value === lastEmitted.current) return;
		const next = parseIsoDate(value);
		setDay(next?.day ?? "");
		setMonth(next?.month ?? "");
		setYear(next?.year ?? "");
		lastEmitted.current = value;
	}, [value]);

	const years = React.useMemo(() => {
		const list: string[] = [];
		for (let y = newestYear; y >= oldestYear; y--) list.push(String(y));
		return list;
	}, [newestYear, oldestYear]);

	const maxDay = month && year ? daysInMonth(Number(year), Number(month)) : 31;
	const days = React.useMemo(
		() => Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, "0")),
		[maxDay],
	);

	function emit(nextDay: string, nextMonth: string, nextYear: string) {
		const iso = nextDay && nextMonth && nextYear ? `${nextYear}-${nextMonth}-${nextDay}` : "";
		lastEmitted.current = iso;
		onChange(iso);
	}

	function clampDay(currentDay: string, targetYear: string, targetMonth: string) {
		if (!currentDay || !targetYear || !targetMonth) return currentDay;
		const max = daysInMonth(Number(targetYear), Number(targetMonth));
		return Number(currentDay) > max ? String(max).padStart(2, "0") : currentDay;
	}

	function handleDayChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setDay(e.target.value);
		emit(e.target.value, month, year);
	}

	function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const nextMonth = e.target.value;
		const clamped = clampDay(day, year, nextMonth);
		setMonth(nextMonth);
		setDay(clamped);
		emit(clamped, nextMonth, year);
	}

	function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const nextYear = e.target.value;
		const clamped = clampDay(day, nextYear, month);
		setYear(nextYear);
		setDay(clamped);
		emit(clamped, month, nextYear);
	}

	return (
		<div className={cn("grid grid-cols-3 gap-2 sm:gap-3", className)} data-slot="date-of-birth-input">
			<Select
				id={id}
				name={name ? `${name}.day` : undefined}
				aria-label="Day"
				value={day}
				onChange={handleDayChange}
				onBlur={onBlur}
				disabled={disabled}
				{...ariaProps}
			>
				<option value="" disabled>
					Day
				</option>
				{days.map((d) => (
					<option key={d} value={d}>
						{Number(d)}
					</option>
				))}
			</Select>

			<Select
				name={name ? `${name}.month` : undefined}
				aria-label="Month"
				value={month}
				onChange={handleMonthChange}
				onBlur={onBlur}
				disabled={disabled}
			>
				<option value="" disabled>
					Month
				</option>
				{MONTHS.map((m) => (
					<option key={m.value} value={m.value}>
						{m.label}
					</option>
				))}
			</Select>

			<Select
				name={name ? `${name}.year` : undefined}
				aria-label="Year"
				value={year}
				onChange={handleYearChange}
				onBlur={onBlur}
				disabled={disabled}
			>
				<option value="" disabled>
					Year
				</option>
				{years.map((y) => (
					<option key={y} value={y}>
						{y}
					</option>
				))}
			</Select>
		</div>
	);
}

export { DateOfBirthInput };
export type { DateOfBirthInputProps };
