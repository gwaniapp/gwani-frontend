import Link from "next/link";
import { Button } from "@repo/ui/button";
import { StatusScreen } from "@/components/StatusScreen";

export default function NotFound() {
	return (
		<StatusScreen
			variant="not-found"
			title="We couldn't find that page"
			description="The link may be broken, or the page may have moved. Let's get you back to finding skilled people you can trust."
			actions={
				<Button asChild size="large">
					<Link href="/">Back to home</Link>
				</Button>
			}
		/>
	);
}
