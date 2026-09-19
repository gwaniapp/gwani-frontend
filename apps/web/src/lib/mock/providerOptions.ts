/**
 * Mock options for the provider registration form. The real backend has no
 * "category" concept (only a flat skills catalog, `GET /skills`), so these
 * group its real skill names for the design's category dropdown and to steer
 * the skill suggestions. States are only mocked for a few countries; any other
 * country gets a free-text field.
 */
export const SERVICE_CATEGORIES = [
	{
		value: "home-repairs",
		label: "Home & Repairs",
		skills: ["Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "Tiling", "Flooring", "HVAC", "Handyman", "Appliance Repair", "Pest Control"],
	},
	{
		value: "cleaning-outdoor",
		label: "Cleaning & Outdoor",
		skills: ["Cleaning", "Landscaping", "Lawn Care"],
	},
	{
		value: "beauty-wellness",
		label: "Beauty & Wellness",
		skills: ["Hair Styling", "Makeup Artistry", "Massage Therapy", "Personal Training", "Tailoring"],
	},
	{
		value: "creative-media",
		label: "Creative & Media",
		skills: ["Photography", "Videography", "Graphic Design", "Translation"],
	},
	{
		value: "technology",
		label: "Technology",
		skills: ["Web Development"],
	},
	{
		value: "events-food",
		label: "Events & Food",
		skills: ["Event Planning", "Catering", "Baking", "DJ Services"],
	},
	{
		value: "education-care",
		label: "Education & Care",
		skills: ["Tutoring", "Babysitting", "Elderly Care", "Pet Care"],
	},
	{
		value: "transport-delivery",
		label: "Transport & Delivery",
		skills: ["Delivery", "Driving", "Moving & Hauling"],
	},
	{
		value: "business-professional",
		label: "Business & Professional",
		skills: ["Accounting & Bookkeeping", "Security Services"],
	},
] as const;

export const ALL_SKILLS: string[] = SERVICE_CATEGORIES.flatMap((category) => [...category.skills]).sort();
