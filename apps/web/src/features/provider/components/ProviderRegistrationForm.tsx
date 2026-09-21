"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Select } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { CountryField, StateField } from "@/components/forms/LocationFields";
import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";
import { SkillsField } from "@/features/provider/components/SkillsField";
import { useSkills } from "@/features/provider/hooks/useProviderProfile";
import {
	providerRegistrationSchema,
	type ProviderRegistrationValues,
} from "@/lib/validations/providerValidations";
import { PLACE_MAX } from "@/lib/validations/rules";
import { useProviderRegistration } from "@/features/provider/hooks/useProviderRegistration";

// Same desktop bump as the sign-up form: 20px labels, 62px-tall fields.
const LABEL_CLASS = "text-b4 md:text-xl md:font-normal";
const FIELD_CLASS = "md:h-15.5";
const ITEM_CLASS = "md:gap-2.5";

/**
 * Provider registration — the first step of building a provider profile,
 * reached from the "Create my provider profile" button after email
 * verification. Simulated end to end; see `useProviderRegistration`.
 *
 * From `lg` up the heading stays put and only the form below it scrolls (the
 * scrollbar is hidden); the scroll region is this component's second child,
 * sized by `OnboardingLayout`'s fixed-height column.
 */
function ProviderRegistrationForm() {
	const form = useForm<ProviderRegistrationValues>({
		resolver: zodResolver(providerRegistrationSchema),
		defaultValues: { bio: "", category: "", skills: [], country: "", state: "", area: "" },
	});
	const skills = useSkills();
	const register = useProviderRegistration(skills.data);

	return (
		<>
			<div className="flex flex-col gap-2 md:gap-4 lg:shrink-0">
				<h1 className="text-h4 font-medium text-foreground md:text-h1">Provider Registration</h1>
				<p className="text-b1 text-neutral-400 md:text-xl md:font-normal">
					Tell us about the service you provide
				</p>
			</div>

			<div className="hide-scroll lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
				<Form {...form}>
					<form
						noValidate
						onSubmit={form.handleSubmit((values) => register.mutate(values))}
						className="flex flex-col gap-5 md:gap-6"
					>
						<FormField
							control={form.control}
							name="bio"
							render={({ field }) => (
								<FormItem className={ITEM_CLASS}>
									<FormLabel className={LABEL_CLASS}>Write a brief about yourself</FormLabel>
									<FormControl>
										<Textarea
											rows={1}
											placeholder="Write briefly about yourself"
											maxLength={500}
											className="field-sizing-content min-h-11 resize-none md:min-h-15.5 md:py-4.5"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem className={ITEM_CLASS}>
									<FormLabel className={LABEL_CLASS}>Skill/service category</FormLabel>
									<FormControl>
										<Select className={FIELD_CLASS} {...field}>
											<option value="">Select category</option>
											{SERVICE_CATEGORIES.map((c) => (
												<option key={c.value} value={c.value} className="text-foreground">
													{c.label}
												</option>
											))}
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<SkillsField labelClassName={LABEL_CLASS} itemClassName={ITEM_CLASS} />

						<CountryField labelClassName={LABEL_CLASS} fieldClassName={FIELD_CLASS} itemClassName={ITEM_CLASS} />

						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
							<StateField labelClassName={LABEL_CLASS} fieldClassName={FIELD_CLASS} itemClassName={ITEM_CLASS} />

							<FormField
								control={form.control}
								name="area"
								render={({ field }) => (
									<FormItem className={ITEM_CLASS}>
										<FormLabel className={LABEL_CLASS}>Area</FormLabel>
										<FormControl>
											<Input
												autoComplete="address-level2"
												maxLength={PLACE_MAX}
												placeholder="Enter area"
												className={FIELD_CLASS}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button
							type="submit"
							size="large"
							className="mt-3 h-11 w-full md:mt-8 md:h-15 md:text-btn-giant"
							loading={register.isPending}
						>
							Proceed
						</Button>
					</form>
				</Form>
			</div>
		</>
	);
}

export { ProviderRegistrationForm };
