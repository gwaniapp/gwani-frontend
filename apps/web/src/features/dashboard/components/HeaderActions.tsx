"use client";

import { Bell } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { initials } from "@/lib/format";

/** No notifications endpoint exists yet, so nothing is unread and the badge stays hidden. */
const UNREAD_NOTIFICATIONS = 0;

/** Bell with an unread-count badge. Doesn't open anything yet — notifications aren't designed, and the backend has no endpoint for them (the count is a placeholder, 0 = no badge). */
function NotificationBell({ className }: { className?: string }) {
	const count = UNREAD_NOTIFICATIONS;

	return (
		<button
			type="button"
			aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
			className={cn(
				"relative flex shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-300",
				className,
			)}
		>
			<Bell className="size-5" aria-hidden="true" />
			{count > 0 && (
				<span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-c3 text-white">
					{count}
				</span>
			)}
		</button>
	);
}

/** The signed-in user's initials in a circle. */
function UserAvatar({ className }: { className?: string }) {
	const { user } = useCurrentUser();

	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex shrink-0 items-center justify-center rounded-full bg-primary-500 text-b4 text-white",
				className,
			)}
		>
			{user ? initials(user.first_name, user.last_name) : ""}
		</span>
	);
}

/** Avatar + first name in the desktop header card. */
function HeaderUser() {
	const { user } = useCurrentUser();

	return (
		<div className="flex items-center gap-3">
			<UserAvatar className="size-10" />
			<span className="text-b2 whitespace-nowrap text-foreground">{user?.first_name ?? ""}</span>
		</div>
	);
}

export { HeaderUser, NotificationBell, UserAvatar };
