import { Star } from "lucide-react";

import { cn } from "./lib/utils";

const SIZE = { sm: "size-4", md: "size-5", lg: "size-6" } as const;

interface StarRatingProps {
	/** Rating out of `max`; shown rounded to the nearest whole star. */
	value: number;
	max?: number;
	size?: keyof typeof SIZE;
	className?: string;
}

/** Read-only row of stars — outlined, with the earned ones filled yellow. */
function StarRating({ value, max = 5, size = "md", className }: StarRatingProps) {
	const filled = Math.round(value);

	return (
		<span
			role="img"
			aria-label={`Rated ${value} out of ${max}`}
			className={cn("inline-flex items-center gap-1", className)}
		>
			{Array.from({ length: max }, (_, index) => (
				<Star
					key={index}
					aria-hidden="true"
					strokeWidth={1.5}
					className={cn(SIZE[size], "text-neutral-800", index < filled ? "fill-warning-300" : "fill-transparent")}
				/>
			))}
		</span>
	);
}

export { StarRating };
export type { StarRatingProps };
