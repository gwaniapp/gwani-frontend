import type { JobStatus } from "@/lib/api/types";

/**
 * Mock data for the provider dashboard. Job rows are a *view model*: the
 * backend's `Job` has no client name, location or date-of-work (only
 * `client_id`, `created_at`, ...), so those come from joins/extra endpoints
 * that don't exist yet.
 */
export interface DashboardJob {
	id: string;
	title: string;
	priceAmount: number;
	priceAsset: string;
	status: JobStatus;
	clientName: string;
	date: string;
	location: string;
}

export const MOCK_PROVIDER = { firstName: "John", lastName: "Doe", unreadNotifications: 10 };

export const MOCK_STATS = { activeJobs: 25, completedJobs: 25, pendingPayments: 25, reputation: 4.8 };

const base = { priceAsset: "USDC", date: "2026-08-20", location: "Mumbai, India" };

export const MOCK_JOBS: DashboardJob[] = [
	{ id: "job-1", title: "Web Designer", priceAmount: 5000, status: "FUNDED", clientName: "John Doe", ...base },
	{ id: "job-2", title: "Web Designer", priceAmount: 5000, status: "PROVIDER_SELECTED", clientName: "John Doe", ...base },
	{ id: "job-3", title: "Web Designer", priceAmount: 5000, status: "FUNDED", clientName: "John Doe", ...base },
	{ id: "job-4", title: "Web Designer", priceAmount: 5000, status: "IN_PROGRESS", clientName: "John Doe", ...base },
	{ id: "job-5", title: "Landing Page Redesign", priceAmount: 1800, status: "IN_PROGRESS", clientName: "Amara Nwosu", ...base, date: "2026-08-22", location: "Lagos, Nigeria" },
	{ id: "job-6", title: "Brand Identity Kit", priceAmount: 2400, status: "FUNDED", clientName: "Kwame Mensah", ...base, date: "2026-08-25", location: "Accra, Ghana" },
	{ id: "job-7", title: "Mobile App UI Design", priceAmount: 7200, status: "PROVIDER_SELECTED", clientName: "Priya Sharma", ...base, date: "2026-08-27", location: "Mumbai, India" },
	{ id: "job-8", title: "E-commerce Storefront", priceAmount: 9500, status: "IN_PROGRESS", clientName: "Wanjiru Kamau", ...base, date: "2026-08-30", location: "Nairobi, Kenya" },
	{ id: "job-9", title: "Web Designer", priceAmount: 3100, status: "FUNDED", clientName: "Sipho Dlamini", ...base, date: "2026-09-02", location: "Johannesburg, South Africa" },
	{ id: "job-10", title: "Portfolio Website", priceAmount: 1200, status: "COMPLETED", clientName: "Ada Okafor", ...base, date: "2026-07-14", location: "Abuja, Nigeria" },
	{ id: "job-11", title: "Social Media Graphics", priceAmount: 650, status: "PAID", clientName: "Efua Boateng", ...base, date: "2026-07-02", location: "Kumasi, Ghana" },
	{ id: "job-12", title: "Web Designer", priceAmount: 4300, status: "POSTED", clientName: "Neha Verma", ...base, date: "2026-09-08", location: "Pune, India" },
];
