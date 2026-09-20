import { RoleRedirect } from "@/features/auth/components/RoleRedirect";

// Not a page — a router. The marketing/landing site is a separate app (`apps/landing`).
export default function Home() {
	return <RoleRedirect />;
}
