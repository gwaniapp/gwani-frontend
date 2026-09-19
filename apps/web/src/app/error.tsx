"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@repo/ui/button";
import { StatusScreen } from "@/components/StatusScreen";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<StatusScreen
			variant="error"
			title="Something went wrong"
			description="We hit a problem on our side. Try again in a moment. Payments held in escrow stay protected until you approve a release."
			actions={
				<>
					<Button size="large" onClick={() => reset()}>
						Try again
					</Button>
					<Button asChild size="large" variant="outline">
						<Link href="/">Back to home</Link>
					</Button>
				</>
			}
			footnote={error.digest ? `Error reference: ${error.digest}` : undefined}
		/>
	);
}
