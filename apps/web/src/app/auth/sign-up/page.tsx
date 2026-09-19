import type { Metadata } from "next";
import { RoleSelection } from "@/features/auth/components/RoleSelection";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
	return <RoleSelection />;
}
