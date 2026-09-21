import { RootRedirect } from "@/features/auth/components/RootRedirect";

/** `/` is only a router: signed-in admins go to the overview, everyone else to sign-in. */
export default function Home() {
	return <RootRedirect />;
}
