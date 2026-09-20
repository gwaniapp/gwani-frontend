"use client";

import { Button } from "@repo/ui/button";

/**
 * The settings forms show up in two places with two looks: inline on desktop
 * (a "panel": blue-outline Cancel; 16px labels and 48px fields from `lg`,
 * 52px fields with 16px text from `xl`, and 18px labels / 56px fields only from
 * `2xl` — the mock's fixed 20px / 62px read too big) and inside a drawer/modal (a "sheet": 16px labels, 44px rounded fields,
 * grey-outline Cancel) — same fields, different chrome, per the mocks.
 */
export type FormLayout = "panel" | "sheet";

export const FORM_STYLES: Record<FormLayout, { label: string; field: string; item: string; form: string }> = {
	panel: { label: "text-b2 font-normal lg:text-b1 2xl:text-lg", field: "h-12 text-b3 xl:h-13 xl:text-b1 2xl:h-14", item: "gap-2 2xl:gap-2.5", form: "gap-5 2xl:gap-6" },
	sheet: { label: "text-b1 font-normal", field: "h-11 rounded-xl", item: "gap-2", form: "gap-5" },
};

/** Cancel + submit side by side. In a panel, Cancel puts the form back as it was; in a sheet, it closes it. */
function FormActions({
	layout,
	onCancel,
	loading,
	disabled,
	submitLabel = "Update",
	destructive,
}: {
	layout: FormLayout;
	onCancel: () => void;
	loading?: boolean;
	disabled?: boolean;
	submitLabel?: string;
	destructive?: boolean;
}) {
	const panel = layout === "panel";
	return (
		<div className={panel ? "mt-2 grid grid-cols-2 gap-5 2xl:gap-12" : "mt-3 grid grid-cols-2 gap-3"}>
			<Button
				type="button"
				variant="outline"
				size="giant"
				disabled={loading}
				onClick={onCancel}
				className={
					panel
						? "h-12 w-full rounded-lg border-primary-500 text-btn-large text-primary-500 hover:bg-primary-100/30 focus-visible:bg-primary-100/30 xl:h-13 2xl:h-14"
						: "h-12 w-full rounded-xl border-neutral-300 text-neutral-600"
				}
			>
				Cancel
			</Button>
			<Button
				type="submit"
				variant={destructive ? "destructive" : "primary"}
				size="giant"
				loading={loading}
				disabled={disabled}
				className={panel ? "h-12 w-full rounded-lg text-btn-large xl:h-13 2xl:h-14" : "h-12 w-full rounded-xl"}
			>
				{submitLabel}
			</Button>
		</div>
	);
}

export { FormActions };
