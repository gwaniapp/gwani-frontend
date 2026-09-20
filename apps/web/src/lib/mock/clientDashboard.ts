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
