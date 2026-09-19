import { cn } from "./lib/utils";

/**
 * Gwani's loading indicator: a twinkling four-point star (the brand mark's
 * sparkle) with two "nodes" orbiting it — a nod to the Stellar network the
 * payments settle on. Pure CSS/SVG, no image to download while the app is
 * already busy loading. Motion is dropped for `prefers-reduced-motion`.
 */
function GwaniLoader({ className }: { className?: string }) {
	return (
		<div role="status" aria-label="Loading" className={cn("relative size-24", className)}>
			<span className="absolute inset-0 rounded-full border border-primary-200/70" />
			<span className="absolute inset-0 animate-orbit motion-reduce:animate-none">
				<span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500" />
			</span>
			<span className="absolute inset-0 animate-orbit-reverse motion-reduce:animate-none">
				<span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary-300" />
			</span>
			<svg
				viewBox="0 0 24 24"
				aria-hidden="true"
				className="absolute inset-0 m-auto size-9 animate-twinkle fill-primary-500 motion-reduce:animate-none"
			>
				<path d="M12 0c.7 7.5 4.5 11.3 12 12-7.5.7-11.3 4.5-12 12-.7-7.5-4.5-11.3-12-12C7.5 11.3 11.3 7.5 12 0Z" />
			</svg>
		</div>
	);
}

export { GwaniLoader };
