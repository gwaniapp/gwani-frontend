import type { AppNotification } from "@/lib/api/types";

/** "JOB_FUNDED" / "job.funded" -> "Job funded", for an item that carries a type but no title. */
function humanize(type: string) {
	const words = type.toLowerCase().replace(/[._-]+/g, " ").trim();
	return words.charAt(0).toUpperCase() + words.slice(1);
}

export function notificationTitle(item: AppNotification) {
	return item.title?.trim() || (item.type ? humanize(item.type) : "Notification");
}

export function notificationText(item: AppNotification) {
	return (item.message ?? item.body ?? "").trim();
}

/** The job a notification is about, if it says so (`job_id` on the item, or in its data / metadata). */
export function notificationJobId(item: AppNotification): string | null {
	const fromData = (source: Record<string, unknown> | null | undefined) => {
		const value = source?.job_id ?? source?.jobId;
		return typeof value === "string" && value ? value : null;
	};
	return item.job_id || fromData(item.data) || fromData(item.metadata) || null;
}

export const isUnread = (item: AppNotification) => !item.read_at;
