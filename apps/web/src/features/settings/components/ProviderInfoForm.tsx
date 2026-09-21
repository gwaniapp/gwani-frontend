"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { Select } from "@repo/ui/select";
import { Skeleton } from "@repo/ui/skeleton";
import { toast } from "@repo/ui/sonner";
import { Textarea } from "@repo/ui/textarea";
import { CountryField, StateField } from "@/components/forms/LocationFields";
import { SkillsField } from "@/features/provider/components/SkillsField";
import { useProviderProfile, useSaveProviderProfile, useSkills } from "@/features/provider/hooks/useProviderProfile";
import { FORM_STYLES, FormActions, type FormLayout } from "@/features/settings/components/formParts";
import { SERVICE_CATEGORIES } from "@/lib/mock/providerOptions";
import { profileToFormValues } from "@/lib/providerProfile";
import { providerRegistrationSchema, type ProviderRegistrationValues } from "@/lib/validations/providerValidations";
import { PLACE_MAX } from "@/lib/validations/rules";

/**
 * Provider Information — the registration form's fields, editing the saved
 * provider profile (`GET` / `PATCH /providers/me/profile`). The category is
 * UI-only (the backend has none) so it's inferred from the saved skills;
 * state and area are unpacked from / packed into the one city string. Providers
 * only. Shows a skeleton while the profile loads and a retry if it can't.
 */
function ProviderInfoForm({ layout, onDone }: { layout: FormLayout; onDone?: () => void }) {
	const profile = useProviderProfile();

	if (profile.isPending) {
		return (
			<div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading provider information">
				{[0, 1, 2, 3].map((row) => (
					<Skeleton key={row} className="h-12 w-full rounded-lg" />
				))}
			</div>
		);
	}

	if (profile.isError) {
		return (
			<div className="flex flex-col items-start gap-3">
				<p role="alert" className="text-b3 text-danger-600">
					We couldn&apos;t load your provider information.
				</p>
				<Button type="button" variant="outline" size="medium" onClick={() => void profile.refetch()}>
					Try again
				</Button>
			</div>
		);
	}

	return <ProviderInfoFormBody layout={layout} onDone={onDone} initial={profileToFormValues(profile.data)} />;
}

function ProviderInfoFormBody({ layout, onDone, initial }: { layout: FormLayout; onDone?: () => void; initial: ProviderRegistrationValues }) {
	const styles = FORM_STYLES[layout];
	const skills = useSkills();
	const form = useForm<ProviderRegistrationValues>({
		resolver: zodResolver(providerRegistrationSchema),
		defaultValues: initial,
	});
	const update = useSaveProviderProfile(skills.data);
	const tagClassName = layout === "panel" ? "md:min-h-12 xl:min-h-13 2xl:min-h-14" : "md:min-h-11";

	return (
		<Form {...form}>
			<form
				noValidate
				onSubmit={form.handleSubmit((values) =>
					update.mutate(values, {
						onSuccess: () => {
							form.reset(values);
							toast.success("Provider information updated");
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
									maxLength={500}
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

				<SkillsField labelClassName={styles.label} itemClassName={styles.item} tagClassName={tagClassName} />

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
									<Input autoComplete="address-level2" maxLength={PLACE_MAX} placeholder="Enter area" className={styles.field} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormActions
					layout={layout}
					loading={update.isPending}
					disabled={skills.isPending || (layout === "panel" && !form.formState.isDirty)}
					onCancel={() => (layout === "panel" ? form.reset(initial) : onDone?.())}
				/>
			</form>
		</Form>
	);
}

export { ProviderInfoForm };
