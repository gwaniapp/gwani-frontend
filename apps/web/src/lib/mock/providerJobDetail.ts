import type { JobStatus } from "@/lib/api/types";
import { MOCK_ALL_JOBS } from "@/lib/mock/providerJobs";
import type { DashboardJob } from "@/lib/mock/providerDashboard";

/**
 * Mock detail for one job. Like the list rows, this is a view model: the
 * backend's `Job` has a description and location but no service category name
 * to show, no client name/location, and no per-step timestamps (status changes
 * would come from the job's history/audit trail).
 */
export interface JobDetail extends DashboardJob {
	category: string;
	description: string;
	clientLocation: string;
	timeline: TimelineStep[];
}

export interface TimelineStep {
	status: JobStatus;
	label: string;
	/** ISO date the step was reached; `null` for steps not reached yet. */
	date: string | null;
	reached: boolean;
}

const STEPS: Array<{ status: JobStatus; label: string; offsetDays: number }> = [
	{ status: "POSTED", label: "Posted", offsetDays: -9 },
	{ status: "PROVIDER_SELECTED", label: "Provider Selected", offsetDays: -8 },
	{ status: "FUNDED", label: "Payment Secured", offsetDays: -7 },
	{ status: "IN_PROGRESS", label: "In Progress", offsetDays: -6 },
	{ status: "COMPLETED", label: "Completed", offsetDays: 0 },
	{ status: "PAID", label: "Paid", offsetDays: 1 },
];

/** Where a status sits on the six-step path. A dispute happens once work has started; a cancelled job never got past being posted. */
function stepIndex(status: JobStatus) {
	if (status === "DISPUTED") return 3;
	if (status === "CANCELLED") return 0;
	return STEPS.findIndex((step) => step.status === status);
}

function shiftDays(iso: string, days: number) {
	const day = new Date(iso);
	day.setUTCDate(day.getUTCDate() + days);
	return day.toISOString().slice(0, 10);
}

/** Steps with dates derived from the job's date, marked reached up to the job's current status. */
export function buildTimeline(status: JobStatus, jobDate: string): TimelineStep[] {
	const current = stepIndex(status);
	return STEPS.map((step, index) => ({
		status: step.status,
		label: step.label,
		reached: index <= current,
		date: index <= current ? shiftDays(jobDate, step.offsetDays) : null,
	}));
}

const CATEGORIES: Record<string, string> = {
	"Web Designer": "Web Design",
	"Landing Page Redesign": "Web Design",
	"Brand Identity Kit": "Graphic Design",
	"Mobile App UI Design": "UI/UX Design",
	"E-commerce Storefront": "Web Development",
	"Portfolio Website": "Web Design",
	"Social Media Graphics": "Graphic Design",
};

const DESCRIPTIONS: Record<string, string> = {
	"Web Designer":
		"Looking for a web designer to build a website for my shop. I need a clean, mobile-friendly design with a product page and a contact form, and I need it urgently.",
};

const CLIENT_LOCATIONS: Record<string, string> = {
	"John Doe": "Lagos, Nigeria",
	"Amara Nwosu": "Lagos, Nigeria",
	"Kwame Mensah": "Accra, Ghana",
	"Priya Sharma": "Mumbai, India",
	"Wanjiru Kamau": "Nairobi, Kenya",
	"Sipho Dlamini": "Johannesburg, South Africa",
};

export function getJobDetail(id: string): JobDetail | undefined {
	const job = MOCK_ALL_JOBS.find((item) => item.id === id);
	if (!job) return undefined;
	return {
		...job,
		category: CATEGORIES[job.title] ?? "Web Design",
		description:
			DESCRIPTIONS[job.title] ??
			`Looking for help with "${job.title}". I'll share the full brief once we start, and I'd like regular updates until it's done.`,
		clientLocation: CLIENT_LOCATIONS[job.clientName] ?? job.location,
		timeline: buildTimeline(job.status, job.date),
	};
}
