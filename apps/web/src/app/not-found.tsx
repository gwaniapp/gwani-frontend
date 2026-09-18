import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@repo/ui/button";
import { StatusPage } from "@repo/ui/status-page";

export default function NotFound() {
	return (
		<StatusPage
			icon={Compass}
			tone="primary"
			title="Page not found"
			description="The page you're looking for doesn't exist or may have moved."
			action={
				<Button asChild>
					<Link href="/">Back to home</Link>
				</Button>
			}
		/>
	);
}
