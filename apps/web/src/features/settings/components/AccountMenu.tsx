"use client";

import { ChevronRight, Headset, KeyRound, LogOut, Store, Trash2, User, type LucideIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useLogout } from "@/features/auth/hooks/useLogout";
import type { SheetId } from "@/features/settings/types";
import { SUPPORT_EMAIL } from "@/lib/site";

const ROW = "flex w-full items-center gap-4 rounded-lg px-1 py-3.5 text-left text-b1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-300";

function Row({ icon: Icon, label, danger, ...props }: { icon: LucideIcon; label: string; danger?: boolean } & React.ComponentProps<"button">) {
	return (
		<button type="button" className={cn(ROW, danger && "text-danger-600")} {...props}>
			<Icon className="size-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
			<span className="flex-1">{label}</span>
			<ChevronRight className="size-5 shrink-0 text-foreground" aria-hidden="true" />
		</button>
	);
}

/**
 * The mobile Account menu (below `lg`): every item opens a drawer, except
 * Contact Support (an email) and Logout. "Provider Information" is providers'
 * only. Change Password, Logout and Delete Account are red, as in the mock.
 */
function AccountMenu({ isProvider, onOpen }: { isProvider: boolean; onOpen: (sheet: SheetId) => void }) {
	const logout = useLogout();

	return (
		<nav aria-label="Account" className="flex flex-col divide-y divide-border">
			<div className="flex flex-col pb-2">
				<Row icon={User} label="Personal Information" onClick={() => onOpen("personal")} />
				{isProvider && <Row icon={Store} label="Provider Information" onClick={() => onOpen("provider")} />}
			</div>

			<div className="flex flex-col py-2">
				<p className="px-1 py-3 text-b1 text-neutral-800">Help &amp; Support</p>
				<a href={`mailto:${SUPPORT_EMAIL}`} className={ROW}>
					<Headset className="size-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
					<span className="flex-1">Contact Support</span>
					<ChevronRight className="size-5 shrink-0 text-foreground" aria-hidden="true" />
				</a>
			</div>

			<div className="flex flex-col pt-2">
				<p className="px-1 py-3 text-b1 text-neutral-800">Account Settings</p>
				<Row icon={KeyRound} label="Change Password" danger onClick={() => onOpen("password")} />
				<Row icon={LogOut} label="Logout" danger onClick={logout} />
				<Row icon={Trash2} label="Delete Account" danger onClick={() => onOpen("delete")} />
			</div>
		</nav>
	);
}

export { AccountMenu };
