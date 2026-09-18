import { Logo } from "@repo/ui/logo";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";

export default function Home() {
	return (
		<main className="custom-container flex flex-1 flex-col items-center justify-center gap-8 py-24 text-center">
			<Logo size="xl" />
			<div className="flex flex-col gap-2">
				<h1 className="text-h3 text-foreground">Monorepo scaffold ready</h1>
				<p className="text-b3 text-muted-foreground max-w-md">
					Turborepo + pnpm, @repo/ui design system, Manrope, and the brand palette are wired up. Drop in
					the PRD when it&apos;s ready.
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-3">
				<Button>Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="destructive">Destructive</Button>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-2">
				<Badge>Default</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="outline">Outline</Badge>
				<Badge variant="destructive">Destructive</Badge>
			</div>
		</main>
	);
}
