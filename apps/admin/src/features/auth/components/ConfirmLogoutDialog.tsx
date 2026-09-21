"use client";

import { LogOut } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";

/**
 * "Are you sure you want to log out?" — every Logout button in the app asks this
 * first (sidebar, mobile menu, account settings). Cancel (or Esc / clicking outside)
 * keeps the person signed in; "Log out" runs `onConfirm`, which is `useLogout`.
 */
function ConfirmLogoutDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className="gap-6 rounded-3xl p-6 sm:max-w-md sm:p-8">
				<DialogHeader className="items-center gap-3 text-center sm:items-start sm:text-left">
					<span className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-600" aria-hidden="true">
						<LogOut className="size-6" />
					</span>
					<DialogTitle className="text-xl font-medium sm:text-xl sm:font-medium">Log out?</DialogTitle>
					<DialogDescription className="text-b3 sm:text-b1">Are you sure you want to log out of Gwani? You&apos;ll need to sign in again to get back to your account.</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" size="large" className="w-full rounded-lg sm:w-auto sm:px-8" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						size="large"
						className="w-full rounded-lg sm:w-auto sm:px-8"
						onClick={() => {
							onOpenChange(false);
							onConfirm();
						}}
					>
						Log out
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { ConfirmLogoutDialog };
