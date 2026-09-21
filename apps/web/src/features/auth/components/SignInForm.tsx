"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@repo/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { signInSchema, type SignInValues } from "@/lib/validations/authValidations";
import { useSignIn } from "@/features/auth/hooks/useSignIn";

// Same desktop bump as the sign-up form: 20px labels, 62px-tall fields.
const LABEL_CLASS = "text-b4 md:text-xl md:font-normal";
const INPUT_CLASS = "md:h-15.5";

/** Sign-in (`useSignIn`), with links to sign up and to "Forgot Password?". */
function SignInForm() {
	const form = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "", rememberMe: true },
	});
	const signIn = useSignIn();

	return (
		<>
			<div className="flex flex-col gap-2 md:gap-4">
				<h1 className="text-h4 font-medium text-foreground md:text-h1">Sign in</h1>
				<p className="text-b1 text-neutral-400 md:max-w-136 md:text-xl md:font-normal">
					Login to your Gwani account to find trusted service providers or offer your skills.
				</p>
			</div>

			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
					className="flex flex-col gap-5 md:gap-6"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>Email Address</FormLabel>
								<FormControl>
									<Input
										type="email"
										autoComplete="email"
										placeholder="Enter your email address"
										className={INPUT_CLASS}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem className="md:gap-2.5">
								<FormLabel className={LABEL_CLASS}>Password</FormLabel>
								<FormControl>
									<PasswordInput
										autoComplete="current-password"
										placeholder="Enter password"
										className={INPUT_CLASS}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex items-center justify-between gap-4">
						<FormField
							control={form.control}
							name="rememberMe"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center gap-3 md:gap-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className="md:size-7"
											/>
										</FormControl>
										<FormLabel className="text-b3 font-normal md:text-b1">Remember me</FormLabel>
									</div>
								</FormItem>
							)}
						/>
						<Link
							href="/auth/forgot-password"
							className="text-b3 text-primary-500 underline-offset-4 hover:underline md:text-b1"
						>
							Forgot Password?
						</Link>
					</div>

					<Button
						type="submit"
						size="large"
						className="mt-2 h-11 w-full md:mt-6 md:h-15 md:text-btn-giant"
						loading={signIn.isPending}
					>
						Sign in
					</Button>
				</form>
			</Form>

			<p className="text-center text-b3 text-foreground md:text-b1">
				Don&apos;t have an account?{" "}
				<Link href="/auth/sign-up" className="font-medium text-primary-500 underline-offset-4 hover:underline">
					Sign up
				</Link>
			</p>
		</>
	);
}

export { SignInForm };
