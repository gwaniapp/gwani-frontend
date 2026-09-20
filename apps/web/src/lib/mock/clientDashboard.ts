import type { JobStatus } from "@/lib/api/types";

/**
 * Mock data for the client dashboard. Like the provider's job rows these are
 * view models: the backend's `Job` has a description, location and the chosen
 * `provider_id`, but the provider's name and the service category's name would
 * need joins/extra calls to show here.
 */
export interface ClientJob {
	id: string;
	title: string;
	providerName: string;
	category: string;
	location: string;
	priceAmount: number;
	priceAsset: string;
	/** ISO date the job was posted. */
	postedDate: string;
	status: JobStatus;
}

export const MOCK_CLIENT_STATS = { completedJobs: 25, totalSpent: 25000, asset: "USDC" };

const base = {
	title: "Kitchen Pipe Repair",
	providerName: "John Doe",
	category: "Plumbing",
	location: "Mumbai, India",
	priceAmount: 2500,
	priceAsset: "USDC",
	postedDate: "2026-08-12",
};

export const MOCK_CLIENT_JOBS: ClientJob[] = [
	{ id: "cjob-1", status: "FUNDED", ...base },
	{ id: "cjob-2", status: "IN_PROGRESS", ...base },
	{ id: "cjob-3", status: "PROVIDER_SELECTED", ...base },
	{ id: "cjob-4", status: "IN_PROGRESS", ...base },
	{ id: "cjob-5", status: "COMPLETED", ...base, title: "Bathroom Leak Fix", priceAmount: 800, postedDate: "2026-07-30" },
	{ id: "cjob-6", status: "PAID", ...base, title: "Water Heater Installation", priceAmount: 1900, postedDate: "2026-07-11" },
];

const TITLES = ["Kitchen Pipe Repair", "Bathroom Leak Fix", "Water Heater Installation", "Wiring Upgrade", "Living Room Repaint", "Drain Unblocking"];
const PROVIDERS = ["John Doe", "Amara Nwosu", "Kwame Mensah", "Priya Sharma", "Wanjiru Kamau", "Sipho Dlamini"];
const STATUSES: JobStatus[] = ["IN_PROGRESS", "COMPLETED", "FUNDED", "PAID", "PROVIDER_SELECTED", "DISPUTED", "POSTED", "CANCELLED"];

/**
 * The client's full list for the My Jobs page: the overview's six plus
 * generated ones (50 in all, like the provider's list) so the tabs and pager
 * have something to work with. Kept separate so the overview's active count
 * doesn't change.
 */
export const MOCK_ALL_CLIENT_JOBS: ClientJob[] = [
	...MOCK_CLIENT_JOBS,
	...Array.from({ length: 50 - MOCK_CLIENT_JOBS.length }, (_, index): ClientJob => {
		const day = new Date(Date.UTC(2026, 6, 28));
		day.setUTCDate(day.getUTCDate() - index * 3);
		return {
			id: `cjob-${MOCK_CLIENT_JOBS.length + index + 1}`,
			title: TITLES[index % TITLES.length] as string,
			providerName: PROVIDERS[index % PROVIDERS.length] as string,
			category: "Plumbing",
			location: "Mumbai, India",
			priceAmount: 500 + ((index * 370) % 4500),
			priceAsset: "USDC",
			postedDate: day.toISOString().slice(0, 10),
			status: STATUSES[index % STATUSES.length] as JobStatus,
		};
	}),
];
