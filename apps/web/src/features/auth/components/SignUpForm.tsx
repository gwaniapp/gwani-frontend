"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { PasswordInput } from "@repo/ui/password-input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/form";
import { clientSignUpSchema, signUpSchema, type SignUpValues } from "@/lib/validations/authValidations";
import { CountryField, StateField } from "@/components/forms/LocationFields";
import { useSignUp } from "@/features/auth/hooks/useSignUp";
import type { SignUpRole } from "@/lib/api/types";

// The mock's desktop inputs/labels are a step larger than the design
// system's defaults (62px-tall fields, 20px labels), so those are bumped at
// `md` here rather than changing `@repo/ui` for every other form.
const LABEL_CLASS = "text-b4 md:text-xl md:font-normal";
const INPUT_CLASS = "md:h-15.5";
const ITEM_CLASS = "md:gap-2.5";

/**
 * Account-creation step. One form for both roles — `role` only decides what
 * gets sent to `POST /auth/signup` and which "switch role" link shows at the
 * bottom. Everything past a successful submit (storing the email, toasting,
 * moving to the OTP step) lives in `useSignUp`.
 */
function SignUpForm({ role }: { role: SignUpRole }) {
	const form = useForm<SignUpValues>({
		// Clients also give a country and state (per the design); providers do that in registration.
		resolver: zodResolver(role === "CLIENT" ? clientSignUpSchema : signUpSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			country: "",
			state: "",
			agreeToTerms: false,
		},
	});
	const signUp = useSignUp(role);

	return (
		<>
			<div className="flex flex-col gap-2 md:gap-4">
				<h1 className="text-h4 font-medium text-foreground md:text-h1">Sign Up</h1>
				<p className="text-b1 text-neutral-400 md:max-w-136 md:text-xl md:font-normal">
					Join Gwani to find trusted service providers or offer your skills.
				</p>
			</div>

			<Form {...form}>
				<form
					noValidate
					onSubmit={form.handleSubmit((values) => signUp.mutate(values))}
					className="flex flex-col gap-5 md:gap-6"
				>
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem className="md:gap-2.5">
									<FormLabel className={LABEL_CLASS}>First Name</FormLabel>
									<FormControl>
										<Input
											autoComplete="given-name"
											placeholder="Enter your first name"
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
							name="lastName"
							render={({ field }) => (
								<FormItem className="md:gap-2.5">
									<FormLabel className={LABEL_CLASS}>Last Name</FormLabel>
									<FormControl>
										<Input
											autoComplete="family-name"
											placeholder="Enter your last name"
											className={INPUT_CLASS}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

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
										autoComplete="new-password"
										placeholder="Enter password"
										className={INPUT_CLASS}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{role === "CLIENT" && (
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
							<CountryField labelClassName={LABEL_CLASS} fieldClassName={INPUT_CLASS} itemClassName={ITEM_CLASS} />
							<StateField labelClassName={LABEL_CLASS} fieldClassName={INPUT_CLASS} itemClassName={ITEM_CLASS} />
						</div>
					)}

					<FormField
						control={form.control}
						name="agreeToTerms"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-start gap-3 md:items-center md:gap-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
											className="mt-0.5 md:mt-0 md:size-7"
										/>
									</FormControl>
									<FormLabel className="block text-b3 font-normal md:text-b1">
										I understand and agree to Gwani{" "}
										<span className="text-primary-500">Terms Of Service</span> and{" "}
										<span className="text-primary-500">Privacy Policy</span>
									</FormLabel>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						size="large"
						className="mt-2 h-11 w-full md:mt-6 md:h-15 md:text-btn-giant"
						loading={signUp.isPending}
					>
						Create Account
					</Button>
				</form>
			</Form>

			<p className="text-center text-b3 text-foreground md:text-b1">
				{role === "PROVIDER" ? (
					<>
						Here to hire?{" "}
						<Link
							href="/auth/sign-up/details?role=client"
							className="font-medium text-primary-500 underline-offset-4 hover:underline"
						>
							Join as a client
						</Link>
					</>
				) : (
					<>
						Looking for work?{" "}
						<Link
							href="/auth/sign-up/details?role=provider"
							className="font-medium text-primary-500 underline-offset-4 hover:underline"
						>
							Join as a provider
						</Link>
					</>
				)}
			</p>
		</>
	);
}

export { SignUpForm };
