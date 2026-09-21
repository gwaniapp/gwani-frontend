"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@repo/ui/sonner";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { PasswordInput } from "@repo/ui/password-input";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useResetPassword, useSendResetCode } from "@/features/auth/hooks/usePasswordReset";
import { FORM_STYLES, FormActions, type FormLayout } from "@/features/settings/components/formParts";
import { logAction } from "@/lib/logger";
import { useAuthStore } from "@/lib/stores/authStore";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validations/authValidations";

/**
 * Change Password. **The backend has no "old password + new password" endpoint**
 * — only the emailed-code reset — so that's what this does: first "Send code"
 * (`POST /auth/forgot-password` to the signed-in user's own email), then the
 * 6-digit code and the new password (`POST /auth/reset-password`). The backend
 * then revokes every session, so on success this signs the person out and sends
 * them to sign-in. On desktop it's an inline panel; on mobile a drawer
 * (`onDone` closes it).
 */
function PasswordForm({ layout = "sheet", onDone }: { layout?: FormLayout; onDone?: () => void }) {
	const styles = FORM_STYLES[layout];
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user } = useCurrentUser();
	const [sent, setSent] = useState(false);
	const sendCode = useSendResetCode();
	const reset = useResetPassword();
	const form = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { code: "", newPassword: "" },
	});

	const email = user?.email ?? "";

	function send() {
		if (!email) return;
		sendCode.mutate(email, {
			onSuccess: () => {
				setSent(true);
				toast.success("We've emailed you a 6-digit code.");
			},
		});
	}

	function cancel() {
		form.reset();
		setSent(false);
		onDone?.();
	}

	if (!sent) {
		return (
			<div className={cn("flex flex-col", styles.form)}>
				<p className="text-b3 text-neutral-500 sm:text-b1">
					To change your password we&apos;ll email a 6-digit code to <span className="font-medium text-foreground">{email || "your email address"}</span>. You&apos;ll
					enter it here with your new password, then sign in again.
				</p>
				<div className={layout === "panel" ? "mt-2 grid grid-cols-2 gap-5 2xl:gap-12" : "mt-3 grid grid-cols-2 gap-3"}>
					<Button type="button" variant="outline" size="giant" onClick={cancel} className="h-12 w-full rounded-xl border-neutral-300 text-neutral-600">
						Cancel
					</Button>
					<Button type="button" size="giant" loading={sendCode.isPending} disabled={!email} onClick={send} className="h-12 w-full rounded-xl">
						Send code
					</Button>
				</div>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				noValidate
				onSubmit={form.handleSubmit((values) =>
					reset.mutate(
						{ email, code: values.code, newPassword: values.newPassword },
						{
							onSuccess: () => {
								// The backend just revoked every session, this one included.
								logAction("settings.change-password", "success", { signedOut: true });
								toast.success("Password updated. Please sign in with your new password.");
								useAuthStore.getState().clear();
								queryClient.clear();
								onDone?.();
								router.push("/auth/sign-in");
							},
						},
					),
				)}
				className={cn("flex flex-col", styles.form)}
			>
				<p className="text-b3 text-neutral-500 sm:text-b1">
					Enter the code we sent to <span className="font-medium text-foreground">{email}</span>.{" "}
					<button type="button" onClick={send} disabled={sendCode.isPending} className="font-medium text-primary-500 underline underline-offset-4 disabled:opacity-60">
						Send a new code
					</button>
				</p>
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem className={styles.item}>
							<FormLabel className={styles.label}>Code</FormLabel>
							<FormControl>
								<Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" className={styles.field} {...field} />
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
							<p className="text-c1 text-neutral-500">At least 8 characters, with an uppercase letter, a lowercase letter and a number.</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormActions layout={layout} loading={reset.isPending} submitLabel="Update password" onCancel={cancel} />
			</form>
		</Form>
	);
}

export { PasswordForm };
