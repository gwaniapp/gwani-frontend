"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { cn } from "@repo/ui/lib/utils";
import { PasswordInput } from "@repo/ui/password-input";
import { FORM_STYLES, FormActions, type FormLayout } from "@/features/settings/components/formParts";
import { useChangePassword } from "@/features/settings/hooks/useSettings";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/settingsValidations";

/**
 * Change Password: Old Password and New Password, as in the mock (no confirm
 * field). Simulated — see `useChangePassword` for the backend gap. On desktop
 * it's an inline panel (Cancel clears it, and it stays put after saving); on
 * mobile it's a drawer (`onDone` closes it).
 */
function PasswordForm({ layout = "sheet", onDone }: { layout?: FormLayout; onDone?: () => void }) {
	const styles = FORM_STYLES[layout];
	const form = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: "", newPassword: "" },
	});
	const change = useChangePassword();

	return (
		<Form {...form}>
			<form
				noValidate
				onSubmit={form.handleSubmit((values) =>
					change.mutate(values, {
						onSuccess: () => {
							form.reset();
							onDone?.();
						},
					}),
				)}
				className={cn("flex flex-col", styles.form)}
			>
				<FormField
					control={form.control}
					name="currentPassword"
					render={({ field }) => (
						<FormItem className={styles.item}>
							<FormLabel className={styles.label}>Old Password</FormLabel>
							<FormControl>
								<PasswordInput autoComplete="current-password" placeholder="Enter old password" className={styles.field} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem className={styles.item}>
							<FormLabel className={styles.label}>New Password</FormLabel>
							<FormControl>
								<PasswordInput autoComplete="new-password" placeholder="Enter new password" className={styles.field} {...field} />
							</FormControl>
							<p className="text-c1 text-neutral-500">
								At least 8 characters, with an uppercase letter, a lowercase letter and a number.
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormActions
					layout={layout}
					loading={change.isPending}
					disabled={layout === "panel" && !form.formState.isDirty}
					onCancel={() => (layout === "panel" ? form.reset() : onDone?.())}
				/>
			</form>
		</Form>
	);
}

export { PasswordForm };
