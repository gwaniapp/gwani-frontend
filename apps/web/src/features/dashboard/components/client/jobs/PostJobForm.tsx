"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox } from "@repo/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { toast } from "@repo/ui/sonner";
import { Textarea } from "@repo/ui/textarea";
import { BackHeader } from "@/features/dashboard/components/BackHeader";
import { usePostJob } from "@/features/jobs/hooks/useJobs";
import { useProvider, useProviderOptions } from "@/features/providers/hooks/useProviders";
import { providerHeadline, providerLocation, providerName, providerUserId } from "@/lib/providers";
import { dueDateFrom, isValidDateString, todayLocal } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { JOB_DURATION_MAX_DAYS, JOB_TITLE_MAX, postJobSchema, type PostJobValues } from "@/lib/validations/jobValidations";
import { digitsOnly, sanitizeAmount } from "@/lib/validations/rules";
import type { ProviderProfile } from "@/lib/api/types";

// Desktop sizes scale with the viewport (the mock's fixed 20px labels / 62px fields read too big).
const LABEL_CLASS = "text-b2 text-foreground md:font-normal lg:text-b1 2xl:text-lg";
const FIELD_CLASS = "md:h-12 md:text-b3 xl:h-13 xl:text-b1 2xl:h-14";

/** The muted line under a provider's name in the list: their trade and where they are. Typing matches it too. */
const optionDescription = (provider: ProviderProfile) => [providerHeadline(provider), providerLocation(provider)].filter(Boolean).join(" · ");

/**
 * "Post a New Job", on the real API. Submitting is one call — `POST /jobs` with the chosen
 * provider, which creates the job already assigned to them — and lands on the new job,
 * where the client funds escrow ("Fund escrow" is offered once a provider is selected).
 *
 * The provider list is the first 50 from `GET /providers/discover`; a provider
 * arriving from "Hire Provider" (`?provider=`) is fetched by id so they're
 * selectable even if they're not in those 50.
 */
function PostJobForm({ defaultProviderId }: { defaultProviderId: string }) {
	const router = useRouter();
	const postJob = usePostJob();
	const options = useProviderOptions();
	const preselected = useProvider(defaultProviderId || undefined);

	const providers = [...(options.data?.items ?? [])];
	if (preselected.data && !providers.some((provider) => provider.id === preselected.data.id)) providers.unshift(preselected.data);

	const form = useForm<PostJobValues>({
		resolver: zodResolver(postJobSchema),
		defaultValues: { providerId: defaultProviderId, title: "", description: "", startDate: "", durationDays: "", amount: "" },
	});

	// The due date the two fields add up to, shown as they're filled in (only once both are valid).
	const [startDate, durationDays] = useWatch({ control: form.control, name: ["startDate", "durationDays"] });
	const dueDatePreview =
		isValidDateString(startDate) && /^\d+$/.test(durationDays) && Number(durationDays) >= 1 && Number(durationDays) <= JOB_DURATION_MAX_DAYS
			? dueDateFrom(startDate, Number(durationDays))
			: null;

	function onSubmit(values: PostJobValues) {
		const chosen = providers.find((provider) => provider.id === values.providerId);
		if (!chosen) {
			form.setError("providerId", { message: "Select a service provider" });
			return;
		}
		postJob.mutate(
			{
				title: values.title,
				description: values.description,
				amount: values.amount,
				dueDate: dueDateFrom(values.startDate, Number(values.durationDays)),
				providerUserId: providerUserId(chosen),
			},
			{
				onSuccess: (job) => {
						toast.success("Job posted. Fund escrow to get the work started.");
					router.push(`/client/dashboard/jobs/${job.id}`);
				},
			},
		);
	}

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<BackHeader href="/client/dashboard/jobs" label="Post a New Job" as="h1" />

			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 lg:gap-6">
					<FormField
						control={form.control}
						name="providerId"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>Service Provider</FormLabel>
								<FormControl>
									<Combobox
										className={FIELD_CLASS}
										disabled={options.isPending && providers.length === 0}
										placeholder={options.isPending ? "Loading providers…" : "Select or type a provider's name"}
										options={providers.map((provider) => ({
											value: provider.id,
											label: providerName(provider),
											description: optionDescription(provider),
										}))}
										emptyText="No provider matches that name, skill or place."
										{...field}
									/>
								</FormControl>
								{options.isError && providers.length === 0 && (
									<p role="alert" className="text-c1 text-danger-600">
										We couldn&apos;t load providers.{" "}
										<button type="button" onClick={() => void options.refetch()} className="font-medium underline underline-offset-4">
											Try again
										</button>
									</p>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>
									Title <span className="text-b3 md:text-b1">(What do you need done?)</span>
								</FormLabel>
								<FormControl>
										<Input placeholder="Add title" maxLength={JOB_TITLE_MAX} className={FIELD_CLASS} {...field} />
									</FormControl>
									<div className="flex items-start justify-between gap-3">
										<FormMessage />
										<span className="ml-auto shrink-0 text-c1 text-neutral-500 tabular-nums" aria-hidden="true">
											{field.value.length}/{JOB_TITLE_MAX}
										</span>
									</div>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>Description</FormLabel>
								<FormControl>
									<Textarea placeholder="Add a brief description" maxLength={5000} className="min-h-28 md:min-h-28 md:text-b3 xl:text-b1" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid gap-5 md:grid-cols-2 lg:gap-6">
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem className="md:gap-2.5">
									<FormLabel className={LABEL_CLASS}>Start date</FormLabel>
									<FormControl>
										<Input type="date" min={todayLocal()} className={FIELD_CLASS} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="durationDays"
							render={({ field }) => (
								<FormItem className="md:gap-2.5">
									<FormLabel className={LABEL_CLASS}>Duration</FormLabel>
									<div className="flex gap-3 md:gap-5">
										<FormControl>
											<Input
												inputMode="numeric"
												autoComplete="off"
												placeholder="7"
												className={`min-w-0 flex-1 ${FIELD_CLASS}`}
												{...field}
												// Whole days only: anything that isn't a digit is dropped.
												onChange={(event) => field.onChange(digitsOnly(event.target.value, 3))}
											/>
										</FormControl>
										<span
											aria-hidden="true"
											className="flex h-11 w-24 shrink-0 items-center justify-center rounded-lg border border-input text-b3 text-neutral-500 md:h-12 md:w-28 md:text-b3 xl:h-13 xl:text-b1 2xl:h-14"
										>
											days
										</span>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{dueDatePreview && (
						<p className="-mt-2 text-b3 text-neutral-600 md:text-b1">
							The work should be finished by <span className="font-medium text-foreground">{formatDate(dueDatePreview)}</span>.
						</p>
					)}

					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>Amount to be paid</FormLabel>
								<div className="flex gap-3 md:gap-5">
									<FormControl>
										<Input
												inputMode="decimal"
												autoComplete="off"
												placeholder="1000"
												className={`min-w-0 flex-1 ${FIELD_CLASS}`}
												{...field}
												// Numbers only: anything that isn't a digit or a decimal point is dropped as it's typed or pasted.
												onChange={(event) => field.onChange(sanitizeAmount(event.target.value))}
											/>
									</FormControl>
									<span
										aria-hidden="true"
										className="flex h-11 w-24 shrink-0 items-center justify-center rounded-lg border border-input text-b3 text-neutral-500 md:h-12 md:w-28 md:text-b3 xl:h-13 xl:text-b1 2xl:h-14"
									>
										USDC
									</span>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" size="giant" className="mt-2 w-full rounded-lg" loading={postJob.isPending}>
						Next
						<ArrowRight className="size-5" aria-hidden="true" />
					</Button>
				</form>
			</Form>
		</div>
	);
}

export { PostJobForm };
