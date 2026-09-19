import { GwaniLoader } from "@repo/ui/gwani-loader";

export default function Loading() {
	return (
		<div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 bg-primary-100/10">
			<GwaniLoader />
			<p className="text-b3 text-muted-foreground">Finding the right people…</p>
		</div>
	);
}
