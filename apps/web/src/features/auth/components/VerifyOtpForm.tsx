"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { OtpInput } from "@repo/ui/otp-input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@repo/ui/form";
import { useSignUpFlowStore } from "@/lib/stores/signUpFlowStore";
import { verifyOtpSchema, type VerifyOtpValues } from "@/lib/validations/authValidations";
import { useResendOtp, useVerifyOtp } from "@/features/auth/hooks/useVerifyOtp";
import { formatCountdown, useCountdown } from "@/features/auth/hooks/useCountdown";
import { EmailVerificationIllustration } from "@/features/auth/components/EmailVerificationIllustration";

const RESEND_SECONDS = 45;

/**
 * Email-verification step after sign-up. Currently simulated end to end —
 * see `useVerifyOtp` for how to make it real.
 */
function VerifyOtpForm() {
	const email = useSignUpFlowStore((state) => state.email);
	useEffect(() => {
		void useSignUpFlowStore.persist.rehydrate();
	}, []);

	const form = useForm<VerifyOtpValues>({
		resolver: zodResolver(verifyOtpSchema),
		defaultValues: { code: "" },
	});
	const verify = useVerifyOtp();
	const resend = useResendOtp();
	const { secondsLeft, restart } = useCountdown(RESEND_SECONDS);
	const canResend = secondsLeft === 0 && !resend.isPending;

	return (
		<div className="flex flex-col gap-8 md:gap-15">
			<div className="flex flex-col items-center gap-8 text-center md:gap-18">
				<EmailVerificationIllustration />
				<div className="flex flex-col items-center gap-3 md:gap-7">
					<h1 className="text-xl font-medium text-foreground md:text-4xl">Email Verification</h1>
					<p className="text-b3 text-foreground md:text-xl">
						Enter the 6-digit verification code sent to
						<span className="mt-1 block font-medium break-all md:mt-3">
							{email || "your email address"}
						</span>
					</p>
				</div>
			</div>

			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit((values) => verify.mutate(values))}
					className="flex flex-col gap-8 md:gap-15"
				>
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem className="items-stretch">
								<FormControl>
									<OtpInput
										value={field.value}
										onChange={field.onChange}
										disabled={verify.isPending}
										groupClassName="gap-2 md:gap-5.5"
										className="h-11 max-w-none text-b1 md:h-15.5"
									/>
								</FormControl>
								<FormMessage className="text-center md:text-b3" />
							</FormItem>
						)}
					/>

					<div className="flex flex-col items-center gap-3.5 text-center text-b3 text-foreground md:gap-2.5 md:text-xl">
						<p>Didn&apos;t receive the code?</p>
						<button
							type="button"
							disabled={!canResend}
							onClick={() => resend.mutate(undefined, { onSuccess: restart })}
							className="text-primary-500 underline-offset-4 outline-none hover:underline focus-visible:underline disabled:cursor-not-allowed md:underline"
						>
							{secondsLeft > 0 ? `Resend code in ${formatCountdown(secondsLeft)}` : "Resend code"}
						</button>
					</div>

					<Button
						type="submit"
						size="large"
						className="h-11 w-full md:h-15 md:text-btn-giant"
						loading={verify.isPending}
					>
						Verify Email
					</Button>
				</form>
			</Form>
		</div>
	);
}

export { VerifyOtpForm };
