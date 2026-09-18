import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doesn't know our custom `--text-*` scale (h1-h5, s1/s2,
 * b1-b4, c1-c3, label, btn-*) is a font-size token, so unqualified it falls
 * back to treating e.g. "text-b1" as an arbitrary color value — the same
 * bucket real colors like "text-primary-foreground" live in, silently
 * evicting whichever one comes first in the class string. Registering the
 * scale under "font-size" fixes that classification.
 */
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [
				{
					text: [
						"h1",
						"h2",
						"h3",
						"h4",
						"h5",
						"s1",
						"s2",
						"b1",
						"b2",
						"b3",
						"b4",
						"c1",
						"c2",
						"c3",
						"label",
						"btn-giant",
						"btn-large",
						"btn-medium",
						"btn-small",
						"btn-tiny",
					],
				},
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
