import { Bell } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { initials } from "@/lib/format";
import { MOCK_PROVIDER } from "@/lib/mock/providerDashboard";

/** Bell with an unread-count badge. Doesn't open anything yet — notifications aren't designed. */
function NotificationBell({ className }: { className?: string }) {
	const count = MOCK_PROVIDER.unreadNotifications;

	return (
		<button
			type="button"
			aria-label={`Notifications, ${count} unread`}
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

function UserAvatar({ className }: { className?: string }) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex shrink-0 items-center justify-center rounded-full bg-primary-500 text-b4 text-white",
				className,
			)}
		>
			{initials(MOCK_PROVIDER.firstName, MOCK_PROVIDER.lastName)}
		</span>
	);
}

export { NotificationBell, UserAvatar };
