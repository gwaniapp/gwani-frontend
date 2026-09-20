import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// This app is the signed-in product; the public site is `apps/landing`. Keep
// crawlers off the dashboards and the backend proxy (`/api/`, see app/api/proxy).
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/client/", "/provider/"] },
		host: SITE_URL.origin,
	};
}
