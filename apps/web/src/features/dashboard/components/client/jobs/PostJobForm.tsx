"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Select } from "@repo/ui/select";
import { toast } from "@repo/ui/sonner";
import { Textarea } from "@repo/ui/textarea";
import { BackHeader } from "@/features/dashboard/components/BackHeader";
import { MOCK_PROVIDERS } from "@/lib/mock/providers";
import { postJobSchema, type PostJobValues } from "@/lib/validations/jobValidations";

// Desktop sizes scale with the viewport (the mock's fixed 20px labels / 62px fields read too big).
const LABEL_CLASS = "text-b2 text-foreground md:font-normal lg:text-b1 2xl:text-lg";
const FIELD_CLASS = "md:h-12 md:text-b3 xl:h-13 xl:text-b1 2xl:h-14";

/**
 * "Post a New Job". The design's Next button leads to a step that isn't
 * designed yet (presumably reviewing the job and funding escrow), so a valid
 * form just confirms it — nothing is created. The real flow is two calls:
 * `POST /jobs` (title, description, price) then `POST /jobs/{id}/select-provider`,
 * then funding. `defaultProviderId` preselects the provider when arriving from
 * "Hire Provider".
 */
function PostJobForm({ defaultProviderId }: { defaultProviderId: string }) {
	const form = useForm<PostJobValues>({
		resolver: zodResolver(postJobSchema),
		defaultValues: { providerId: defaultProviderId, title: "", description: "", amount: "" },
	});

	function onSubmit() {
		toast.info("Job details look good. The next step (review and fund escrow) isn't designed yet.");
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
									<Select className={FIELD_CLASS} {...field}>
										<option value="">Select service provider</option>
										{MOCK_PROVIDERS.map((provider) => (
											<option key={provider.id} value={provider.id} className="text-foreground">
												{provider.name} · {provider.headline} · {provider.location}
											</option>
										))}
									</Select>
								</FormControl>
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
									<Input placeholder="Add title" maxLength={200} className={FIELD_CLASS} {...field} />
								</FormControl>
								<FormMessage />
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

					<Button type="submit" size="giant" className="mt-2 w-full rounded-lg">
						Next
						<ArrowRight className="size-5" aria-hidden="true" />
					</Button>
				</form>
			</Form>
		</div>
	);
}

export { PostJobForm };
