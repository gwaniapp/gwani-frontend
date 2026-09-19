import { COUNTRY_NAMES } from "@repo/ui/lib/country-names";

// Plain comparison, not `localeCompare` (see phone-input.tsx — locale collation differs between SSR and the browser).
export const COUNTRIES = Object.entries(COUNTRY_NAMES).sort(([, a], [, b]) => (a < b ? -1 : a > b ? 1 : 0));

/**
 * Mock states/regions, only for a few countries; any other country gets a
 * free-text field. The real backend has no state field (country + city only).
 */
export const MOCK_STATES: Partial<Record<string, string[]>> = {
	NG: ["Abuja (FCT)", "Anambra", "Delta", "Enugu", "Kaduna", "Kano", "Lagos", "Ogun", "Oyo", "Rivers"],
	GH: ["Ashanti", "Central", "Eastern", "Greater Accra", "Northern", "Volta", "Western"],
	KE: ["Kisumu", "Mombasa", "Nairobi", "Nakuru", "Uasin Gishu"],
	ZA: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"],
};
