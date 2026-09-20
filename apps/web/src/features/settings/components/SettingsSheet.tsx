"use client";

import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "@repo/ui/responsive-dialog";
import { cn } from "@repo/ui/lib/utils";

/**
 * A settings form in its overlay: a bottom drawer below 640px (drag handle,
 * centred title, as in the mobile mocks) and a centred modal from there up.
 * The content unmounts on close, so every open starts from the saved values.
 */
function SettingsSheet({
	open,
	onOpenChange,
	title,
	description,
	danger,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	danger?: boolean;
	children: React.ReactNode;
}) {
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className="sm:max-w-xl">
				<ResponsiveDialogHeader className="items-center sm:items-start sm:pr-10">
					<ResponsiveDialogTitle
						className={cn(
							"text-center text-xl font-medium text-foreground sm:text-left sm:text-xl sm:font-medium",
							danger && "text-danger-600",
						)}
					>
						{title}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription className="sr-only">{description}</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				{children}
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

export { SettingsSheet };
