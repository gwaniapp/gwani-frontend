import type { JobStatus } from "@/lib/api/types";
import { SAMPLE_PUBLIC_KEY } from "@/lib/wallet";
import { MOCK_PROVIDER } from "@/lib/mock/providerDashboard";

/**
 * Mock data for the provider's own profile. Mixes what the backend has
 * (bio, skills, reputation, jobs_completed, location, wallet) with things it
 * doesn't (a job title/headline, an avatar URL you can show, per-job client
 * names). The numbers are the mock's own, deliberately not derived from each
 * other (the design shows 22 / 20 / 27 for related counts).
 */
export const MOCK_PROFILE = {
	firstName: MOCK_PROVIDER.firstName,
	lastName: MOCK_PROVIDER.lastName,
	headline: "Plumber",
	location: "Lekki, Lagos",
	walletVerified: true,
	rating: 4.8,
	jobsDone: 22,
	completedJobs: 20,
	about:
		"Licensed plumber with over ten years of experience across homes and small offices. I handle repairs, installations and emergency call-outs, and I always explain the fix and the cost before I start. Neat work, fair prices, and I keep clients updated until the job is done.",
	skills: ["Plumbing", "Pipe Fitting", "Leak Repair", "Handyman", "Appliance Repair"],
	walletPublicKey: SAMPLE_PUBLIC_KEY,
};

export interface WorkHistoryItem {
	id: string;
	title: string;
	clientName: string;
	amount: number;
	asset: string;
	date: string;
	status: JobStatus;
}

const TITLES = [
	"Kitchen Pipe Repair",
	"Bathroom Leak Fix",
	"Water Heater Installation",
	"Drain Unblocking",
	"Toilet Repair",
	"Sink Replacement",
];
const CLIENTS = ["Janet Doe", "Amara Nwosu", "Kwame Mensah", "Priya Sharma", "Wanjiru Kamau", "Sipho Dlamini"];
const AMOUNTS = [500, 320, 950, 180, 240, 410];

/** 27 completed jobs, newest first, so the pager has something to page through. */
export const MOCK_HISTORY: WorkHistoryItem[] = Array.from({ length: 27 }, (_, index) => {
	const day = new Date(Date.UTC(2026, 3, 15));
	day.setUTCDate(day.getUTCDate() - index * 6);
	return {
		id: `history-${index + 1}`,
		title: TITLES[index % TITLES.length] as string,
		clientName: CLIENTS[index % CLIENTS.length] as string,
		amount: AMOUNTS[index % AMOUNTS.length] as number,
		asset: "USDC",
		date: day.toISOString().slice(0, 10),
		status: "COMPLETED",
	};
});
