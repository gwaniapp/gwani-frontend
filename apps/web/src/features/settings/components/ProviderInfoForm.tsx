"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Select } from "@repo/ui/select";
import { TagInput } from "@repo/ui/tag-input";
import { Textarea } from "@repo/ui/textarea";
import { CountryField, StateField } from "@/components/forms/LocationFields";
import { FORM_STYLES, FormActions, type FormLayout } from "@/features/settings/components/formParts";
import { useUpdateProviderProfile } from "@/features/settings/hooks/useSettings";
import { MOCK_PROVIDER_INFO } from "@/lib/mock/account";
import { ALL_SKILLS, SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";
import { providerRegistrationSchema, type ProviderRegistrationValues } from "@/lib/validations/providerValidations";

/**
 * Provider Information — the registration form's fields, prefilled, for
 * editing later (bio, category, skills, country, state/city, area). Same
 * schema and same backend gaps as registration; see `useUpdateProviderProfile`.
 * Providers only.
 */
function ProviderInfoForm({ layout, onDone }: { layout: FormLayout; onDone?: () => void }) {
	const styles = FORM_STYLES[layout];
	const form = useForm<ProviderRegistrationValues>({
		resolver: zodResolver(providerRegistrationSchema),
		defaultValues: MOCK_PROVIDER_INFO,
	});
	const update = useUpdateProviderProfile();
	const category = useWatch({ control: form.control, name: "category" });
	const skillSuggestions = SERVICE_CATEGORIES.find((c) => c.value === category)?.skills ?? ALL_SKILLS;

	return (
		<Form {...form}>
			<form
				noValidate
				onSubmit={form.handleSubmit((values) =>
					update.mutate(values, {
						onSuccess: () => {
							form.reset(values);
							onDone?.();
						},
					}),
				)}
				className={cn("flex flex-col", styles.form)}
			>
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem className={styles.item}>
							<FormLabel className={styles.label}>Write a brief about yourself</FormLabel>
							<FormControl>
								<Textarea
									rows={1}
									placeholder="Write briefly about yourself"
									className={cn("field-sizing-content resize-none", layout === "panel" ? "min-h-12 py-3 text-b3 xl:min-h-13 xl:text-b1 2xl:min-h-14" : "min-h-11 rounded-xl")}
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
						<FormItem className={styles.item}>
							<FormLabel className={styles.label}>Skill/service category</FormLabel>
							<FormControl>
								<Select className={styles.field} {...field}>
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

				<FormField
					control={form.control}
					name="skills"
					render={({ field }) => (
						<FormItem className={styles.item}>
							<FormLabel className={styles.label}>What skill/service(s) do you provide?</FormLabel>
							<FormControl>
								<TagInput
									name={field.name}
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									suggestions={[...skillSuggestions]}
									placeholder="Type in as many"
									className={layout === "panel" ? "md:min-h-12 xl:min-h-13 2xl:min-h-14" : "md:min-h-11"}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<CountryField labelClassName={styles.label} fieldClassName={styles.field} itemClassName={styles.item} />

				<div className="grid grid-cols-2 gap-x-3 lg:gap-x-6">
					<StateField labelClassName={styles.label} fieldClassName={styles.field} itemClassName={styles.item} />
					<FormField
						control={form.control}
						name="area"
						render={({ field }) => (
							<FormItem className={styles.item}>
								<FormLabel className={styles.label}>Area</FormLabel>
								<FormControl>
									<Input autoComplete="address-level2" placeholder="Enter area" className={styles.field} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormActions
					layout={layout}
					loading={update.isPending}
					disabled={layout === "panel" && !form.formState.isDirty}
					onCancel={() => (layout === "panel" ? form.reset(MOCK_PROVIDER_INFO) : onDone?.())}
				/>
			</form>
		</Form>
	);
}

export { ProviderInfoForm };
