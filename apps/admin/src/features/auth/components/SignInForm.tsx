"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Logo } from "@repo/ui/logo";
import { PasswordInput } from "@repo/ui/password-input";
import { useSignIn } from "@/features/auth/hooks/useSignIn";
import { signInSchema, type SignInValues } from "@/lib/validations/authValidations";

/** Admin sign-in: one centred card on the tinted page, in the same look as the Gwani app's forms. */
function SignInForm() {
	const form = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" },
	});
	const signIn = useSignIn();

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-primary-100/10 px-5 py-10">
			<Logo size="lg" className="h-10 md:h-12" />
			<div className="flex w-full max-w-md flex-col gap-8 rounded-3xl bg-white p-6 shadow-[0_4px_24px_rgb(0_0_0/0.06)] md:p-10">
				<div className="flex flex-col gap-2">
					<span className="flex w-fit items-center gap-2 rounded-full bg-primary-100/50 px-3 py-1 text-c1 text-primary-600">
						<ShieldCheck className="size-4" aria-hidden="true" />
						Admin console
					</span>
					<h1 className="text-h4 font-medium text-foreground md:text-h3">Sign in</h1>
					<p className="text-b3 text-neutral-500 md:text-b1">This area is for Gwani staff. Use your admin account.</p>
				</div>

				<Form {...form}>
					<form noValidate onSubmit={form.handleSubmit((values) => signIn.mutate(values))} className="flex flex-col gap-5">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input type="email" autoComplete="email" maxLength={254} placeholder="Enter your email address" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<PasswordInput autoComplete="current-password" maxLength={128} placeholder="Enter password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" size="large" className="mt-2 h-11 w-full md:h-12" loading={signIn.isPending}>
							Sign in
						</Button>
					</form>
				</Form>
			</div>
		</main>
	);
}

export { SignInForm };
