import { cn } from "@repo/ui/lib/utils";
import { formatDayMonth } from "@/lib/format";
import type { TimelineStep } from "@/lib/jobs";

// Half a step column minus the circle's radius (16px) and a 12px gap, so the
// lines stop short of the circle instead of running into it.
const LINE = "hidden h-px bg-primary-200 md:absolute md:top-4 md:block md:w-[calc(50%-1.75rem)]";

/**
 * A job's path through the status flow. Six columns with the connecting line
 * running across on `md`+; a vertical list below that. Steps not reached yet
 * are hollow and carry no date.
 */
function JobTimeline({ steps }: { steps: TimelineStep[] }) {
	return (
		<ol aria-label="Job progress" className="flex flex-col md:grid md:grid-cols-6">
			{steps.map((step, index) => (
				<li
					key={step.status}
					aria-current={step.reached && !steps[index + 1]?.reached ? "step" : undefined}
					className="relative flex items-start gap-4 pb-6 last:pb-0 md:flex-col md:items-center md:gap-2 md:pb-0"
				>
					<span aria-hidden="true" className={cn(LINE, "left-0")} />
					<span aria-hidden="true" className={cn(LINE, "right-0")} />
					{index < steps.length - 1 && (
						<span aria-hidden="true" className="absolute top-10 bottom-1 left-4 w-px bg-primary-200 md:hidden" />
					)}

					<span
						className={cn(
							"relative flex size-8 shrink-0 items-center justify-center rounded-full",
							step.reached ? "bg-primary-500" : "border border-primary-200 bg-white",
						)}
					>
						{step.reached && <span className="size-3.5 rounded-full bg-white" />}
					</span>

					<div className="flex flex-col md:items-center md:text-center">
						<span className={cn("text-b2 md:text-b1", step.reached ? "text-foreground" : "text-neutral-500")}>
							{step.label}
						</span>
						<span className="min-h-5 text-c1 text-neutral-500 md:text-b3">
							{step.date ? formatDayMonth(step.date) : <span className="sr-only">{step.reached ? "Reached" : "Not reached yet"}</span>}
						</span>
					</div>
				</li>
			))}
		</ol>
	);
}

export { JobTimeline };
