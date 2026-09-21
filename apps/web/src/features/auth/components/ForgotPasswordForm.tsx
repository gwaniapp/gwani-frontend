"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@repo/ui/sonner";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@repo/ui/password-input";
import { useResetPassword, useSendResetCode } from "@/features/auth/hooks/usePasswordReset";
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordValues, type ResetPasswordValues } from "@/lib/validations/authValidations";
import { digitsOnly, EMAIL_MAX, PASSWORD_MAX } from "@/lib/validations/rules";

// Same desktop sizing as the sign-in form: 20px labels, 62px-tall fields.
const LABEL_CLASS = "text-b4 md:text-xl md:font-normal";
const INPUT_CLASS = "md:h-15.5";

/**
 * "Forgot password?" in two steps on one page, on the backend's emailed-code reset:
 * the email (`POST /auth/forgot-password` — always answers the same, so it never
 * reveals whether an account exists), then the 6-digit code and a new password
 * (`POST /auth/reset-password`). Success goes back to sign-in. There was no
 * design for it; it borrows the sign-in form's look.
 */
function ForgotPasswordForm() {
	const router = useRouter();
	const [email, setEmail] = useState<string | null>(null);
	const sendCode = useSendResetCode();
	const reset = useResetPassword();
	const emailForm = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
	const resetForm = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { code: "", newPassword: "" } });

	const backToSignIn = (
		<p className="text-center text-b3 text-foreground md:text-b1">
			Remembered it?{" "}
			<Link href="/auth/sign-in" className="font-medium text-primary-500 underline-offset-4 hover:underline">
				Back to sign in
			</Link>
		</p>
	);

	if (email === null) {
		return (
			<>
				<div className="flex flex-col gap-2 md:gap-4">
					<h1 className="text-h4 font-medium text-foreground md:text-h1">Forgot password?</h1>
					<p className="text-b1 text-neutral-400 md:max-w-136 md:text-xl md:font-normal">
						Enter the email address on your account and we&apos;ll send you a 6-digit code to set a new password.
					</p>
				</div>
				<Form {...emailForm}>
					<form
						noValidate
						onSubmit={emailForm.handleSubmit((values) =>
							sendCode.mutate(values.email, {
								onSuccess: () => {
									setEmail(values.email);
									toast.success("If that email has an account, we've sent it a code.");
								},
							}),
						)}
						className="flex flex-col gap-5 md:gap-6"
					>
						<FormField
							control={emailForm.control}
							name="email"
							render={({ field }) => (
								<FormItem className="md:gap-2.5">
									<FormLabel className={LABEL_CLASS}>Email Address</FormLabel>
									<FormControl>
										<Input type="email" autoComplete="email" maxLength={EMAIL_MAX} placeholder="Enter your email address" className={INPUT_CLASS} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" size="large" className="mt-2 h-11 w-full md:mt-6 md:h-15 md:text-btn-giant" loading={sendCode.isPending}>
							Send code
						</Button>
					</form>
				</Form>
				{backToSignIn}
			</>
		);
	}

	return (
		<>
			<div className="flex flex-col gap-2 md:gap-4">
				<h1 className="text-h4 font-medium text-foreground md:text-h1">Set a new password</h1>
				<p className="text-b1 text-neutral-400 md:max-w-136 md:text-xl md:font-normal">
					Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>, then choose a new password.
				</p>
			</div>
			<Form {...resetForm}>
				<form
					noValidate
					onSubmit={resetForm.handleSubmit((values) =>
						reset.mutate(
							{ email, code: values.code, newPassword: values.newPassword },
							{
								onSuccess: () => {
									toast.success("Password updated. Please sign in with your new password.");
									router.push("/auth/sign-in");
								},
							},
						),
					)}
					className="flex flex-col gap-5 md:gap-6"
				>
					<FormField
						control={resetForm.control}
						name="code"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>Code</FormLabel>
								<FormControl>
									<Input
										inputMode="numeric"
										autoComplete="one-time-code"
										placeholder="6-digit code"
										className={INPUT_CLASS}
										{...field}
										onChange={(event) => field.onChange(digitsOnly(event.target.value))}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={resetForm.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>New Password</FormLabel>
								<FormControl>
									<PasswordInput autoComplete="new-password" maxLength={PASSWORD_MAX} placeholder="Enter new password" className={INPUT_CLASS} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<p className="text-b3 text-neutral-500 md:text-b1">
						Didn&apos;t get it?{" "}
						<button
							type="button"
							disabled={sendCode.isPending}
							onClick={() => sendCode.mutate(email, { onSuccess: () => toast.success("We've sent a new code.") })}
							className="font-medium text-primary-500 underline underline-offset-4 disabled:opacity-60"
						>
							Send a new code
						</button>
					</p>
					<Button type="submit" size="large" className="mt-2 h-11 w-full md:mt-6 md:h-15 md:text-btn-giant" loading={reset.isPending}>
						Update password
					</Button>
				</form>
			</Form>
			{backToSignIn}
		</>
	);
}

export { ForgotPasswordForm };
