"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "./lib/utils";
import { Input } from "./input";

/** Input with a trailing show/hide toggle — the "Password" field from the Input sheet. */
function PasswordInput({
	className,
	...props
}: Omit<React.ComponentProps<"input">, "type">) {
	const [visible, setVisible] = React.useState(false);

	return (
		<div className="relative">
			<Input
				type={visible ? "text" : "password"}
				className={cn("pr-10", className)}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? "Hide password" : "Show password"}
				className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
			>
				{visible ? (
					<EyeOff className="size-4" aria-hidden="true" />
				) : (
					<Eye className="size-4" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}

export { PasswordInput };
