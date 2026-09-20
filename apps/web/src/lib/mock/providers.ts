import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";

/**
 * Mock data for the client's Find Providers page — 128 generated providers
 * (the mobile mock says "128 providers found"). The mocks show one repeated
 * placeholder ("Jane Doe, Plumber, 4.0, 22 jobs, Lekki, Lagos"), so the names,
 * trades and figures here are varied to make search and filters testable.
 * The backend's `GET /providers/discover` returns `items` with reputation and
 * `jobs_completed` but no "category" or trade title — same gaps as the
 * registration form (see `providerOptions.ts`).
 */
export interface DiscoverableProvider {
	id: string;
	name: string;
	/** What they do, e.g. "Plumber" — the mock's second line. */
	headline: string;
	/** A value from `SERVICE_CATEGORIES`. */
	category: string;
	location: string;
	rating: number;
	jobsCompleted: number;
}

const TRADES: Array<{ headline: string; category: string }> = [
	{ headline: "Plumber", category: "home-repairs" },
	{ headline: "Electrician", category: "home-repairs" },
	{ headline: "Carpenter", category: "home-repairs" },
	{ headline: "Painter", category: "home-repairs" },
	{ headline: "Cleaner", category: "cleaning-outdoor" },
	{ headline: "Landscaper", category: "cleaning-outdoor" },
	{ headline: "Hair Stylist", category: "beauty-wellness" },
	{ headline: "Photographer", category: "creative-media" },
	{ headline: "Graphic Designer", category: "creative-media" },
	{ headline: "Web Developer", category: "technology" },
	{ headline: "Event Planner", category: "events-food" },
	{ headline: "Caterer", category: "events-food" },
	{ headline: "Tutor", category: "education-care" },
	{ headline: "Driver", category: "transport-delivery" },
	{ headline: "Accountant", category: "business-professional" },
];

const FIRST = ["Jane", "Amara", "Kwame", "Priya", "Wanjiru", "Sipho", "Ada", "Efua", "Tunde", "Zanele", "Chidi", "Mariam"];
const LAST = ["Doe", "Nwosu", "Mensah", "Sharma", "Kamau", "Dlamini", "Okafor", "Boateng", "Adeyemi", "Khumalo"];
const PLACES = [
	"Lekki, Lagos",
	"Ikeja, Lagos",
	"Abuja, Nigeria",
	"Accra, Ghana",
	"Kumasi, Ghana",
	"Nairobi, Kenya",
	"Johannesburg, South Africa",
	"Cape Town, South Africa",
];

export const MOCK_PROVIDERS: DiscoverableProvider[] = Array.from({ length: 128 }, (_, index) => {
	const trade = TRADES[index % TRADES.length]!;
	return {
		id: `provider-${index + 1}`,
		name: `${FIRST[index % FIRST.length]} ${LAST[(index * 7) % LAST.length]}`,
		headline: trade.headline,
		category: trade.category,
		location: PLACES[(index * 3) % PLACES.length]!,
		// 3.0 – 5.0 in tenths, spread deterministically.
		rating: 3 + ((index * 37) % 21) / 10,
		jobsCompleted: 3 + ((index * 53) % 78),
	};
});

export const CATEGORY_OPTIONS = SERVICE_CATEGORIES.map(({ value, label }) => ({ value, label }));

export const LOCATION_OPTIONS = [...new Set(MOCK_PROVIDERS.map((provider) => provider.location))].sort();

export const RATING_OPTIONS = [
	{ value: 4.5, label: "4.5 & up" },
	{ value: 4, label: "4.0 & up" },
	{ value: 3.5, label: "3.5 & up" },
];
