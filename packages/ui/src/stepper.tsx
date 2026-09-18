import { cn } from "./lib/utils";

interface StepperProps {
	steps: string[];
	/** 1-indexed — matches how the steps are labelled ("1", "2", "3"). */
	currentStep: number;
	className?: string;
}

/**
 * Horizontal progress stepper — numbered circles joined by short, fixed-
 * width trail segments (not a full-width stretch), every step's label
 * always visible underneath its own circle rather than only the current
 * one. An earlier version only showed the current step's label — the
 * actual onboarding mocks show every label at once, muted for steps not
 * yet reached.
 */
function Stepper({ steps, currentStep, className }: StepperProps) {
	return (
		<div className={cn("flex items-start", className)}>
			{steps.map((label, index) => {
				const step = index + 1;
				const reached = step <= currentStep;
				return (
					<div key={label} className="flex items-start">
						{index > 0 && (
							<div
								aria-hidden="true"
								className={cn(
									"mt-4 h-px w-12 shrink-0 sm:w-20",
									reached ? "bg-primary-500" : "bg-border",
								)}
							/>
						)}
						<div className="flex flex-col items-center gap-2">
							<span
								className={cn(
									"flex size-8 shrink-0 items-center justify-center rounded-full text-c2 font-semibold",
									reached
										? "bg-primary-500 text-primary-foreground"
										: "border border-border bg-background text-muted-foreground",
								)}
							>
								{step}
							</span>
							<span
								className={cn(
									"text-c2 whitespace-nowrap sm:text-b4",
									reached ? "font-medium text-primary-600" : "text-muted-foreground",
								)}
							>
								{label}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export { Stepper };
export type { StepperProps };
