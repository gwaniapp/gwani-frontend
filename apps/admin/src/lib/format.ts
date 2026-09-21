const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const amountFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 7 });

/** 5000 -> "5,000 USDC" */
export function formatAmount(amount: number, asset: string) {
	return `${amountFormat.format(amount)} ${asset}`;
}

const dateParts = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** ISO date -> "20 Aug, 2026". Fixed to UTC so the server and browser always agree. */
export function formatDate(iso: string) {
	const parts = Object.fromEntries(dateParts.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
	return `${parts.day} ${parts.month}, ${parts.year}`;
}

export function initials(firstName: string, lastName: string) {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** ISO date -> "12 Apr" (UTC, like `formatDate`). */
export function formatDayMonth(iso: string) {
	return dayMonth.format(new Date(iso));
}

const clock = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

/** ISO timestamp -> "10:26 AM" (UTC, like `formatDate`, so server and browser agree). */
export function formatTime(iso: string) {
	return clock.format(new Date(iso));
}

/** Signed amount -> "+1,000.00 USDC" / "-500.00 USDC" (always two decimals, as wallet figures are shown). */
export function formatSignedAmount(amount: number, asset: string) {
	const sign = amount < 0 ? "-" : "+";
	return `${sign}${money.format(Math.abs(amount))} ${asset}`;
}

/** 1200 -> "1,200.00 USDC" */
export function formatMoney(amount: number, asset: string) {
	return `${money.format(amount)} ${asset}`;
}
