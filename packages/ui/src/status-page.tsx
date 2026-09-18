import type { LucideIcon } from "lucide-react";

import { cn } from "./lib/utils";

/**
 * Shared shape for full-page states — error and not-found both reduce to
 * icon badge + heading + description + one action, just with different
 * tone/copy/icon. Keeps them from drifting apart the way separate
 * hand-rolled pages would.
 */
const TONE_BADGE = {
	danger: "bg-danger-100 text-danger-600",
	primary: "bg-primary-100 text-primary-700",
	neutral: "bg-neutral-100 text-neutral-500",
} as const;

interface StatusPageProps {
	icon: LucideIcon;
	tone?: keyof typeof TONE_BADGE;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

function StatusPage({
	icon: Icon,
	tone = "neutral",
	title,
	description,
	action,
	className,
}: StatusPageProps) {
	return (
		<div
			className={cn(
				"flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center",
				className,
			)}
		>
			<span
				className={cn(
					"flex size-14 items-center justify-center rounded-full",
					TONE_BADGE[tone],
				)}
			>
				<Icon className="size-6" aria-hidden="true" />
			</span>
			<div className="flex flex-col gap-1">
				<h1 className="text-h4 text-foreground">{title}</h1>
				{description && (
					<p className="text-b3 text-muted-foreground max-w-sm">
						{description}
					</p>
				)}
			</div>
			{action}
		</div>
	);
}

export { StatusPage };
export type { StatusPageProps };
