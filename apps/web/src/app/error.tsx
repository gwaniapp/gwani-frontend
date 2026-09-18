"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@repo/ui/button";
import { StatusPage } from "@repo/ui/status-page";

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
		<StatusPage
			icon={TriangleAlert}
			tone="danger"
			title="Something went wrong"
			description="We hit a snag processing that. Try again, and if it keeps happening, let us know."
			action={<Button onClick={() => reset()}>Try again</Button>}
		/>
	);
}
