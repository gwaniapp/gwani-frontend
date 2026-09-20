import { buildWorkHistory, type WorkHistoryItem } from "@/lib/mock/providerProfile";
import { MOCK_PROVIDERS } from "@/lib/mock/providers";
import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";
import { SAMPLE_PUBLIC_KEY } from "@/lib/wallet";

/**
 * What a client sees when previewing a provider: the list row's fields plus
 * the parts of a full profile. Everything beyond the list row is generated —
 * the backend's provider profile has a bio, skills, reputation and
 * `jobs_completed` but no "trade" title, and no per-job client names in a
 * public work history.
 */
export interface ProviderPreview {
	id: string;
	name: string;
	headline: string;
	location: string;
	rating: number;
	/** The list's "(N jobs)" figure — shown as "jobs done" and as the completed count. */
	jobsDone: number;
	about: string;
	skills: string[];
	walletVerified: boolean;
	walletPublicKey: string;
	history: WorkHistoryItem[];
}

const TITLES_BY_CATEGORY: Record<string, string[]> = {
	"home-repairs": ["Kitchen Pipe Repair", "Wiring Upgrade", "Wardrobe Installation", "Living Room Repaint", "Leak Fix", "Door Repair"],
	"cleaning-outdoor": ["Deep Home Clean", "Garden Makeover", "Office Cleaning", "Lawn Trimming", "Move-out Clean"],
	"beauty-wellness": ["Bridal Styling", "Braiding Session", "Home Massage", "Makeup for Event", "Hair Treatment"],
	"creative-media": ["Wedding Shoot", "Logo Design", "Product Photos", "Brand Kit", "Event Coverage"],
	technology: ["Business Website", "Landing Page", "Online Store", "Portfolio Site", "Web App Fixes"],
	"events-food": ["Birthday Party", "Corporate Lunch", "Wedding Catering", "Event Setup", "Pastry Order"],
	"education-care": ["Maths Tutoring", "Exam Prep", "After-school Care", "Weekend Lessons", "Homework Help"],
	"transport-delivery": ["Airport Transfer", "Furniture Delivery", "City Errand Run", "Day Hire", "Move Assistance"],
	"business-professional": ["Monthly Bookkeeping", "Tax Filing", "Payroll Setup", "Accounts Review", "Audit Prep"],
};

export function getProviderPreview(id: string): ProviderPreview | undefined {
	const index = MOCK_PROVIDERS.findIndex((provider) => provider.id === id);
	const provider = MOCK_PROVIDERS[index];
	if (!provider) return undefined;

	const trade = provider.headline.toLowerCase();
	const skills = SERVICE_CATEGORIES.find((category) => category.value === provider.category)?.skills.slice(0, 5) ?? [];

	return {
		id: provider.id,
		name: provider.name,
		headline: provider.headline,
		location: provider.location,
		rating: provider.rating,
		jobsDone: provider.jobsCompleted,
		about: `Experienced ${trade} based in ${provider.location}, with ${provider.jobsCompleted} jobs completed on Gwani. I explain the work and the price before I start, keep clients updated along the way, and stand behind the result.`,
		skills: [...skills],
		walletVerified: true,
		walletPublicKey: SAMPLE_PUBLIC_KEY,
		history: buildWorkHistory(provider.jobsCompleted, TITLES_BY_CATEGORY[provider.category] ?? ["Service Job"], index),
	};
}
