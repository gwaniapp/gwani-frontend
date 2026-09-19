import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignUpDetailsPage({
	searchParams,
}: PageProps<"/auth/sign-up/details">) {
	const { role } = await searchParams;

	if (role === "client") return <SignUpForm role="CLIENT" />;
	if (role === "provider") return <SignUpForm role="PROVIDER" />;

	// No/unknown role (e.g. someone landed here directly) — send them to pick one.
	redirect("/auth/sign-up");
}
