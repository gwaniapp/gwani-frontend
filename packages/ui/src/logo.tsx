import { cn } from "./lib/utils";

/**
 * Text-based placeholder wordmark — no brand mark has been supplied yet.
 * Swap this for an `<img>`-based mark (see peakline's `Logo` for the
 * pattern: plain `<img>`, not `next/image`, since this package is
 * consumed under pnpm's strict linking) once real logo assets exist.
 */
const SIZE_CLASS = {
	sm: "text-s2",
	md: "text-h5",
	lg: "text-h4",
	xl: "text-h3",
} as const;

const VARIANT_CLASS = {
	default: "text-primary-600",
	dark: "text-white",
} as const;

interface LogoProps extends React.ComponentProps<"span"> {
	size?: keyof typeof SIZE_CLASS;
	variant?: keyof typeof VARIANT_CLASS;
}

function Logo({ size = "md", variant = "default", className, ...props }: LogoProps) {
	return (
		<span
			className={cn("font-sans font-bold tracking-tight", SIZE_CLASS[size], VARIANT_CLASS[variant], className)}
			{...props}
		>
			gwani
		</span>
	);
}

export { Logo };
export type { LogoProps };
