"use client";

import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { initials } from "@/lib/format";

/** The signed-in admin in the header card: initials, first name and an "Admin" tag. */
function HeaderUser() {
	const { user } = useCurrentUser();

	return (
		<div className="flex items-center gap-3">
			<span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-b4 text-white">
				{user ? initials(user.first_name, user.last_name) : ""}
			</span>
			<div className="flex flex-col leading-tight">
				<span className="text-b2 whitespace-nowrap text-foreground">{user?.first_name ?? ""}</span>
				<span className="text-c1 text-primary-600">Admin</span>
			</div>
		</div>
	);
}

export { HeaderUser };
