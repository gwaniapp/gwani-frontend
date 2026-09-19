import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// `/api/` is just the backend proxy (see app/api/proxy) — nothing there is
// meant to be indexed.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/", disallow: "/api/" },
		host: SITE_URL.origin,
	};
}
