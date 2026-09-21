/** Today's date in the person's own time zone as "YYYY-MM-DD" — what `<input type="date">` uses, and comparable as text. */
export function todayLocal() {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}`;
}

/** True for a real calendar date written as "YYYY-MM-DD" (so "2026-02-31" is not). */
export function isValidDateString(value: string) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return false;
	const [, year, month, day] = match.map(Number) as [number, number, number, number];
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * The job's due date: the start date plus the duration in days, as the end of that
 * day (UTC) in the ISO 8601 form `POST /jobs` wants for `due_date` — the backend's one
 * date field (it has no separate start date or duration).
 */
export function dueDateFrom(startDate: string, durationDays: number) {
	const [year, month, day] = startDate.split("-").map(Number) as [number, number, number];
	return new Date(Date.UTC(year, month - 1, day + durationDays, 23, 59, 59)).toISOString();
}
