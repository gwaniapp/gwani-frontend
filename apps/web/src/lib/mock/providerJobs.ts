import type { JobStatus } from "@/lib/api/types";
import { MOCK_JOBS, type DashboardJob } from "@/lib/mock/providerDashboard";

/**
 * Mock data for the My Jobs page: the overview's 12 jobs plus generated ones,
 * 50 in all (the mobile mock says "Showing 10 of 50"). Same view-model caveats
 * as `providerDashboard.ts`.
 */
const TITLES = ["Web Designer", "Landing Page Redesign", "Brand Identity Kit", "Mobile App UI Design", "E-commerce Storefront", "Portfolio Website"];
const CLIENTS = ["John Doe", "Amara Nwosu", "Kwame Mensah", "Priya Sharma", "Wanjiru Kamau", "Sipho Dlamini", "Ada Okafor", "Efua Boateng"];
const PLACES = ["Mumbai, India", "Lagos, Nigeria", "Accra, Ghana", "Nairobi, Kenya", "Johannesburg, South Africa", "Abuja, Nigeria"];
const AMOUNTS = [5000, 1800, 2400, 7200, 9500, 1200, 650, 3100];
const STATUSES: JobStatus[] = ["IN_PROGRESS", "COMPLETED", "FUNDED", "PAID", "PROVIDER_SELECTED", "DISPUTED", "IN_PROGRESS", "COMPLETED"];

const generated: DashboardJob[] = Array.from({ length: 50 - MOCK_JOBS.length }, (_, index) => {
	const day = new Date(Date.UTC(2026, 7, 20));
	day.setUTCDate(day.getUTCDate() - index * 3);
	return {
		id: `job-${MOCK_JOBS.length + index + 1}`,
		title: TITLES[index % TITLES.length] as string,
		priceAmount: AMOUNTS[index % AMOUNTS.length] as number,
		priceAsset: "USDC",
		status: STATUSES[index % STATUSES.length] as JobStatus,
		clientName: CLIENTS[index % CLIENTS.length] as string,
		date: day.toISOString().slice(0, 10),
		location: PLACES[index % PLACES.length] as string,
	};
});

export const MOCK_ALL_JOBS: DashboardJob[] = [...MOCK_JOBS, ...generated];

/**
 * The page's tabs. The backend has no "on hold" status — a disputed job is the
 * closest thing (work paused while it's resolved), so that's what the tab shows.
 * "All" (`statuses: null`) also includes open and cancelled jobs.
 */
export const JOB_FILTERS: Array<{ id: string; label: string; statuses: JobStatus[] | null }> = [
	{ id: "all", label: "All", statuses: null },
	{ id: "in-progress", label: "In Progress", statuses: ["PROVIDER_SELECTED", "FUNDED", "IN_PROGRESS"] },
	{ id: "completed", label: "Completed", statuses: ["COMPLETED", "PAID"] },
	{ id: "on-hold", label: "On Hold", statuses: ["DISPUTED"] },
];
