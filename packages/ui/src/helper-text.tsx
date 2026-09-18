import { cn } from "./lib/utils";

/** Hint text below a form field — from the Input sheet's "Helper Text". Pass `error` to switch it to the destructive color for a validation message. */
function HelperText({
	className,
	error,
	...props
}: React.ComponentProps<"p"> & { error?: boolean }) {
	return (
		<p
			data-slot="helper-text"
			className={cn(
				"text-c1",
				error ? "text-destructive" : "text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { HelperText };
