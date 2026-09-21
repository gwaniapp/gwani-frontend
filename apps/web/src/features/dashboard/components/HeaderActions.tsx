"use client";

import { cn } from "@repo/ui/lib/utils";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useProfilePicture } from "@/features/settings/hooks/useAvatar";
import { initials } from "@/lib/format";

/** The signed-in user's profile picture in a circle, or their initials until they've uploaded one. */
function UserAvatar({ className }: { className?: string }) {
	const { user } = useCurrentUser();
	const picture = useProfilePicture();
	const url = picture.data ?? null;

	return (
		<span
			aria-hidden="true"
			style={url ? { backgroundImage: `url(${url})` } : undefined}
			className={cn(
				"flex shrink-0 items-center justify-center rounded-full bg-primary-500 bg-cover bg-center text-b4 text-white",
				className,
			)}
		>
			{!url && user ? initials(user.first_name, user.last_name) : ""}
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

export { HeaderUser, UserAvatar };
