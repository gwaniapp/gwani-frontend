import { cn } from "@repo/ui/lib/utils";
import type { UserRole } from "@/lib/api/types";

const ROLE_STYLES: Record<UserRole, string> = {
	ADMIN: "bg-primary-100 text-primary-700",
	PROVIDER: "bg-info-100 text-info-700",
	CLIENT: "bg-muted text-neutral-700",
};

const ROLE_LABELS: Record<UserRole, string> = { ADMIN: "Admin", PROVIDER: "Provider", CLIENT: "Client" };

const PILL = "inline-flex w-fit shrink-0 items-center rounded-full px-3 py-0.5 text-c1 whitespace-nowrap";

function RoleBadge({ role }: { role: UserRole }) {
	return <span className={cn(PILL, ROLE_STYLES[role] ?? "bg-muted text-neutral-700")}>{ROLE_LABELS[role] ?? role}</span>;
}

/** Active / Suspended / Erased for a user row. */
function UserStatusBadge({ suspended, erased }: { suspended: boolean; erased?: boolean }) {
	if (erased) return <span className={cn(PILL, "bg-muted text-neutral-500")}>Erased</span>;
	return suspended ? <span className={cn(PILL, "bg-danger-100 text-danger-700")}>Suspended</span> : <span className={cn(PILL, "bg-success-100 text-success-700")}>Active</span>;
}

export { RoleBadge, UserStatusBadge };
