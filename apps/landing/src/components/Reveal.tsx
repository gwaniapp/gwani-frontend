"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/ui/lib/utils";

interface RevealProps extends React.ComponentProps<"div"> {
	/** Extra delay before the reveal starts, for staggering a group of items. */
	delayMs?: number;
}

/**
 * Fades + slides content up as it scrolls into view, once, via
 * IntersectionObserver (no animation library — this is the only place
 * apps/landing needs one). Respects `prefers-reduced-motion` by skipping the
 * transform/opacity animation and just rendering the content as-is.
 */
function Reveal({ delayMs = 0, className, style, children, ...props }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(
				// motion-reduce: skip the animation entirely via CSS rather than a JS
				// branch in the effect (calling setState synchronously there would
				// trigger a cascading render) — content just renders in place.
				"transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
				visible
					? "translate-y-0 opacity-100"
					: "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
				className,
			)}
			style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms", ...style }}
			{...props}
		>
			{children}
		</div>
	);
}

export { Reveal };
