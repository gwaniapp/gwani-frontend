import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// This is the public marketing site — unlike apps/web, nothing here needs
// hiding from crawlers.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		host: SITE_URL.origin,
	};
}
