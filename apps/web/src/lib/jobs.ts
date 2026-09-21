import { formatUserLocation } from "@/lib/providers";
import type { Job, JobStateTransition, JobStatus } from "@/lib/api/types";

/**
 * What the dashboards need from a `Job`. The backend's job is just: id, title,
 * description, price (a decimal *string*), asset, status, client/provider ids
 * and timestamps. It has **no client name, location or category**, so the
 * screens show only what exists (the mocks had those fields; they're gone until
 * the backend provides them).
 */
export interface DashboardJob {
	id: string;
	title: string;
	priceAmount: number;
	priceAsset: string;
	status: JobStatus;
	/** ISO date the job was posted. */
	date: string;
	/** The other side, by name: the client on a provider's cards, the assigned provider on a client's. Absent until known (a job with no provider yet). */
	person?: string;
	/** Where the assigned provider is — client cards only (a provider's own list carries their own location, which says nothing new). */
	place?: string;
	/** ISO datetime the client asked for the work by, when they set one. */
	dueDate?: string;
}

export function toDashboardJob(job: Job): DashboardJob {
	const other = job.client ?? job.provider;
	const person = other ? [other.first_name, other.last_name].filter(Boolean).join(" ") : "";
	const place = job.provider ? formatUserLocation(job.location) : "";
	return {
		person: person || undefined,
		place: place || undefined,
		dueDate: job.due_date ?? undefined,
		id: job.id,
		title: job.title,
		priceAmount: Number(job.price_amount),
		priceAsset: job.price_asset,
		status: job.status,
		date: job.created_at,
	};
}

/** Jobs a provider is currently working on or being paid for. */
export const ACTIVE_STATUSES: ReadonlySet<JobStatus> = new Set(["PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS"]);

/**
 * The status tabs on the Jobs pages. The backend has no "on hold" status — a
 * disputed job is the closest thing (work paused while it's resolved), so that's
 * what the tab shows. "All" (`statuses: null`) also includes open and cancelled jobs.
 */
export const JOB_FILTERS: Array<{ id: string; label: string; statuses: JobStatus[] | null }> = [
	{ id: "all", label: "All", statuses: null },
	{ id: "in-progress", label: "In Progress", statuses: ["PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS"] },
	{ id: "completed", label: "Completed", statuses: ["COMPLETED", "PAID"] },
	{ id: "on-hold", label: "On Hold", statuses: ["DISPUTED"] },
];

/** Sum of the prices of jobs in these statuses (all in the platform's one stablecoin, so assets aren't converted). */
export function sumPrices(jobs: Job[], statuses: JobStatus[]) {
	const wanted = new Set(statuses);
	return jobs.filter((job) => wanted.has(job.status)).reduce((total, job) => total + Number(job.price_amount), 0);
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export interface TimelineStep {
	status: JobStatus;
	label: string;
	/** ISO timestamp the step was reached (from the job's transition history); `null` when unknown or not reached. */
	date: string | null;
	reached: boolean;
}

const STEPS: Array<{ status: JobStatus; label: string }> = [
	{ status: "POSTED", label: "Posted" },
	{ status: "PROVIDER_SELECTED", label: "Provider Selected" },
	{ status: "FUNDED", label: "Payment Secured" },
	{ status: "IN_PROGRESS", label: "In Progress" },
	{ status: "COMPLETED", label: "Completed" },
	{ status: "PAID", label: "Paid" },
];

/**
 * The six-step path with real dates: a step is reached if the job got there
 * (a transition *to* it, or a later step was reached — escrow funding moves a
 * job FUNDED → IN_PROGRESS on its own), dated by the transition that entered it
 * (`GET /jobs/{id}/transitions`; "Posted" by the job's creation). A DISPUTED
 * job shows through Completed (a dispute can only be raised there); a CANCELLED
 * one shows only what it reached before.
 */
export function buildTimeline(job: Pick<Job, "status" | "created_at" | "timeline">, transitions: JobStateTransition[]): TimelineStep[] {
	const dateOf = new Map<JobStatus, string>();
	// The job's own timeline (`GET /jobs/{id}`) has dates; the transitions list is the fallback (it has been observed empty).
	for (const step of job.timeline ?? []) if (step.date) dateOf.set(step.status, step.date);
	for (const transition of transitions) if (!dateOf.has(transition.to)) dateOf.set(transition.to, transition.created_at);
	dateOf.set("POSTED", job.created_at);

	let furthest = STEPS.findIndex((step) => step.status === job.status);
	if (job.status === "DISPUTED") furthest = STEPS.findIndex((step) => step.status === "COMPLETED");
	for (const [index, step] of STEPS.entries()) if (dateOf.has(step.status)) furthest = Math.max(job.status === "CANCELLED" ? 0 : furthest, index);
	if (furthest < 0) furthest = 0;

	return STEPS.map((step, index) => ({
		status: step.status,
		label: step.label,
		reached: index <= furthest,
		date: index <= furthest ? (dateOf.get(step.status) ?? null) : null,
	}));
}
