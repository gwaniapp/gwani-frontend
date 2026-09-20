"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { toast } from "@repo/ui/sonner";
import { Textarea } from "@repo/ui/textarea";
import { JobDialog, JobSummary } from "@/features/dashboard/components/jobs/JobDialogParts";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { simulateRequest } from "@/lib/simulation";
import type { JobDetail } from "@/lib/mock/providerJobDetail";
import { rejectJobSchema, type RejectJobValues } from "@/lib/validations/jobValidations";

interface RejectJobDialogProps {
	job: JobDetail;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Called once the (simulated) request succeeds, so the page behind can show the new status. */
	onRejected: () => void;
}

/**
 * "Reject this Job" — a provider turns down a job they were selected for,
 * with a reason for the client. SIMULATED, and **the backend has no endpoint
 * for this**: providers can only `mark-completed`, and `dispute` only works on
 * a COMPLETED job. Going live needs something like
 * `POST /jobs/{id}/reject { reason }` (reason ≤ 500 characters, matching the
 * transitions' `note`), and — once escrow is funded — a refund to the client
 * (`POST /jobs/{id}/escrow/refund`), ending in CANCELLED. The mock's subtitle
 * was copy-pasted from the completion dialog ("mark it as completed"), so it's
 * reworded here. The mock has no success step: submitting closes the dialog,
 * toasts, and the page shows the job as Cancelled.
 */
function RejectJobDialog({ job, open, onOpenChange, onRejected }: RejectJobDialogProps) {
	const form = useForm<RejectJobValues>({
		resolver: zodResolver(rejectJobSchema),
		defaultValues: { reason: "" },
	});
	const reject = useMutation({
		mutationFn: (values: RejectJobValues) => simulateRequest(values),
		onSuccess: () => {
			onRejected();
			onOpenChange(false);
			toast.success("Job rejected. We've let the client know.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error)),
	});

	// Start each time with an empty box and no leftover errors.
	useEffect(() => {
		if (open) form.reset({ reason: "" });
	}, [open, form]);

	return (
		<JobDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Reject this Job"
			description="Let the client know you can't take this job."
			blockDismiss={reject.isPending}
		>
			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit((values) => reject.mutate(values))}
					className="flex flex-col gap-6 px-5 py-6 sm:gap-8 sm:px-10 sm:py-8"
				>
					<JobSummary title={job.title} clientName={job.clientName} amount={job.priceAmount} asset={job.priceAsset} />

					<div className="flex flex-col gap-2">
						<p className="text-b2 font-medium text-foreground sm:text-b1 sm:font-medium">Are you sure you want to reject this job?</p>
						<p className="text-b3 text-neutral-500 sm:text-b1">This will notify the client that you have rejected this job.</p>
					</div>

					<FormField
						control={form.control}
						name="reason"
						render={({ field }) => (
							<FormItem className="sm:gap-3">
								<FormLabel className="text-b1 text-foreground sm:text-b1 sm:font-normal">Reason for rejection</FormLabel>
								<FormControl>
									<Textarea
										rows={2}
										maxLength={500}
										placeholder="Write briefly about why you're rejecting this job"
										className="min-h-20 rounded-2xl sm:min-h-30.5 sm:px-5 sm:py-4"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex flex-col-reverse gap-3 pt-2 sm:grid sm:grid-cols-[1fr_1.3fr] sm:gap-4 sm:pt-4">
						<Button
							type="button"
							variant="outline"
							size="giant"
							className="w-full rounded-lg"
							disabled={reject.isPending}
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" size="giant" className="w-full rounded-lg" loading={reject.isPending}>
							Submit
							<Check className="size-5" aria-hidden="true" />
						</Button>
					</div>
				</form>
			</Form>
		</JobDialog>
	);
}

export { RejectJobDialog };
