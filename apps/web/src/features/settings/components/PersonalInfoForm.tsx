"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { FORM_STYLES, FormActions, type FormLayout } from "@/features/settings/components/formParts";
import { useUpdateProfile } from "@/features/settings/hooks/useSettings";
import { SUPPORT_EMAIL } from "@/lib/site";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { profileSchema, type ProfileValues } from "@/lib/validations/settingsValidations";
import { NAME_MAX } from "@/lib/validations/rules";

/**
 * Personal Information: first name, last name, email. Only the names are
 * editable — that's all `PATCH /users/me` accepts — so the email is read-only
 * (changing it would mean re-verifying it, which the backend has no flow for).
 * In a panel, Cancel restores the saved values; in a sheet it closes it.
 */
function PersonalInfoForm({ layout, onDone }: { layout: FormLayout; onDone?: () => void }) {
	const styles = FORM_STYLES[layout];
	const { user } = useCurrentUser();
	const saved: ProfileValues = { firstName: user?.first_name ?? "", lastName: user?.last_name ?? "" };
	const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: saved });
	const update = useUpdateProfile();

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
				<div className={cn("grid gap-5", layout === "panel" ? "grid-cols-2 gap-x-5" : "grid-cols-1")}>
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem className={styles.item}>
								<FormLabel className={styles.label}>First Name</FormLabel>
								<FormControl>
									<Input autoComplete="given-name" maxLength={NAME_MAX} placeholder="Enter your first name" className={styles.field} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem className={styles.item}>
								<FormLabel className={styles.label}>Last Name</FormLabel>
								<FormControl>
									<Input autoComplete="family-name" maxLength={NAME_MAX} placeholder="Enter your last name" className={styles.field} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className={cn("flex flex-col", styles.item)}>
					<label htmlFor={`email-${layout}`} className={cn("font-medium text-foreground", styles.label)}>
						Email Address
					</label>
					<Input id={`email-${layout}`} type="email" value={user?.email ?? ""} readOnly disabled className={styles.field} />
					<p className="text-c1 text-neutral-500">
						To change your email, contact{" "}
						<a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary-500 underline-offset-4 hover:underline">
							{SUPPORT_EMAIL}
						</a>
						.
					</p>
				</div>

				<FormActions
					layout={layout}
					loading={update.isPending}
					disabled={layout === "panel" && !form.formState.isDirty}
					onCancel={() => (layout === "panel" ? form.reset(saved) : onDone?.())}
				/>
			</form>
		</Form>
	);
}

export { PersonalInfoForm };
