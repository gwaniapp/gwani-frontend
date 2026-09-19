import logoSrc from "./assets/logos/primary-logo.svg";
import { cn } from "./lib/utils";

/**
 * Plain <img>, not next/image — this file is bundled into every app that
 * imports it, and `next/image` isn't resolvable from inside this package
 * under pnpm's strict linking (see CLAUDE.md). Wrap it in your own
 * `next/link` where you need it to be clickable.
 */
const SIZE_CLASS = {
	sm: "h-6",
	md: "h-8",
	lg: "h-6 md:h-13",
	xl: "h-16",
} as const;

interface LogoProps extends Omit<React.ComponentProps<"img">, "src" | "alt"> {
	size?: keyof typeof SIZE_CLASS;
}

function Logo({ size = "md", className, ...props }: LogoProps) {
	return (
		<img
			src={logoSrc.src}
			alt="Gwani"
			className={cn("w-auto", SIZE_CLASS[size], className)}
			{...props}
		/>
	);
}

export { Logo };
export type { LogoProps };
