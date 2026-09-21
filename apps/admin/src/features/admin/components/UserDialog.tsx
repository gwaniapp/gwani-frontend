"use client";

import { useState } from "react";
import { Download, ShieldCheck, ShieldMinus, UserCheck, UserX, Eraser } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Select } from "@repo/ui/select";
import { toast } from "@repo/ui/sonner";
import { AdminDialog, Detail } from "@/components/AdminDialog";
import { RoleBadge, UserStatusBadge } from "@/components/Badges";
import { ConfirmStep } from "@/components/ConfirmStep";
import { IdValue } from "@/components/CopyButton";
import { useCurrentUser } from "@/features/auth/hooks/useSession";
import { useExportUser, useUserAction, userActionError, type UserAction } from "@/features/admin/hooks/useAdminData";
import { formatDate } from "@/lib/format";
import { fullName } from "@/lib/labels";
import type { AdminUser, UserRole } from "@/lib/api/types";

type Step = "suspend" | "unsuspend" | "promote" | "demote" | "erase";

/** Saves the export as a JSON file — the person's data as the backend returned it. */
function download(filename: string, data: unknown) {
	const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

function ActionButton({ icon: Icon, label, hint, danger, disabled, onClick }: { icon: typeof UserX; label: string; hint: string; danger?: boolean; disabled?: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className="flex w-full items-start gap-3 rounded-xl border border-border bg-white p-3.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
		>
			<Icon className={danger ? "mt-0.5 size-5 shrink-0 text-danger-600" : "mt-0.5 size-5 shrink-0 text-primary-500"} aria-hidden="true" />
			<span className="flex flex-col gap-0.5">
				<span className={danger ? "text-b3 font-medium text-danger-600 lg:text-b1" : "text-b3 font-medium text-foreground lg:text-b1"}>{label}</span>
				<span className="text-c1 text-neutral-500 lg:text-b3">{hint}</span>
			</span>
		</button>
	);
}

/**
 * One user: who they are, and everything an admin can do to the account. Actions that change or
 * remove anything go through a confirm step in the same dialog (erase also makes you type the email);
 * every one is recorded in the audit log by the backend. An admin can't suspend or erase another
 * admin (the backend refuses — demote them first), and can't act on their own account here.
 */
function UserDialog({ user, open, onOpenChange }: { user: AdminUser; open: boolean; onOpenChange: (open: boolean) => void }) {
	const { user: me } = useCurrentUser();
	const [step, setStep] = useState<Step | null>(null);
	const [demoteTo, setDemoteTo] = useState<Exclude<UserRole, "ADMIN">>("CLIENT");
	const [error, setError] = useState("");
	const action = useUserAction(user.id);
	const exportData = useExportUser(user.id);

	const erased = Boolean(user.deleted_at);
	const self = me?.id === user.id;
	const isAdmin = user.role === "ADMIN";

	function run(kind: UserAction) {
		setError("");
		action.mutate(kind, {
			onSuccess: () => onOpenChange(false),
			onError: (failure) => setError(userActionError(failure, kind.kind)),
		});
	}

	function exportNow() {
		exportData.mutate(undefined, {
			onSuccess: (data) => {
				download(`gwani-user-${user.id}.json`, data);
				toast.success("Data exported. The export is recorded in the audit log.");
			},
			onError: () => toast.error("We couldn't export this user's data."),
		});
	}

	const location = user.location ? [user.location.area, user.location.city, user.location.state, user.location.country].filter(Boolean).join(", ") : "";

	return (
		<AdminDialog
			open={open}
			onOpenChange={onOpenChange}
			title={erased ? "Erased account" : fullName(user)}
			description={erased ? "This account's personal data has been erased." : user.email}
			blockDismiss={action.isPending}
		>
			<div className="flex flex-col gap-7">
				<dl className="flex flex-col gap-3.5">
					<Detail label="Role">
						<RoleBadge role={user.role} />
					</Detail>
					<Detail label="Status">
						<UserStatusBadge suspended={user.suspended} erased={erased} />
					</Detail>
					<Detail label="Email verified">{user.email_verified === undefined ? "—" : user.email_verified ? "Yes" : "No"}</Detail>
					<Detail label="Joined">{formatDate(user.created_at)}</Detail>
					{location && <Detail label="Location">{location}</Detail>}
					<Detail label="User id">
						<IdValue value={user.id} label="User id" />
					</Detail>
				</dl>

				{step === null ? (
					erased ? (
						<p className="rounded-xl bg-muted px-4 py-3 text-b3 text-neutral-600">Nothing more can be done to an erased account.</p>
					) : (
						<div className="flex flex-col gap-3">
							<p className="text-b1 font-medium text-foreground">Actions</p>
							{user.suspended ? (
								<ActionButton icon={UserCheck} label="Reinstate account" hint="Lets them sign in and use Gwani again." onClick={() => setStep("unsuspend")} />
							) : (
								<ActionButton
									icon={UserX}
									label="Suspend account"
									hint={isAdmin ? "An admin can't be suspended — remove their admin role first." : self ? "You can't suspend your own account." : "Blocks every request they make until reinstated."}
									disabled={isAdmin || self}
									onClick={() => setStep("suspend")}
								/>
							)}
							{isAdmin ? (
								<ActionButton icon={ShieldMinus} label="Remove admin role" hint={self ? "You can't remove your own admin role." : "Turns them into a client or a provider."} disabled={self} onClick={() => setStep("demote")} />
							) : (
								<ActionButton icon={ShieldCheck} label="Make admin" hint="Gives them full access to this console. Recorded in the audit log." onClick={() => setStep("promote")} />
							)}
							<ActionButton icon={Download} label={exportData.isPending ? "Exporting…" : "Export their data"} hint="Downloads everything held about them (a data access request)." disabled={exportData.isPending} onClick={exportNow} />
							<ActionButton
								icon={Eraser}
								danger
								label="Erase personal data"
								hint={isAdmin ? "An admin can't be erased — remove their admin role first." : self ? "You can't erase your own account." : "Anonymises their details and closes the account. Can't be undone."}
								disabled={isAdmin || self}
								onClick={() => setStep("erase")}
							/>
						</div>
					)
				) : step === "suspend" ? (
					<ConfirmStep
						title={`Suspend ${fullName(user)}?`}
						description="They'll be blocked from signing in or using Gwani until you reinstate them."
						confirmLabel="Suspend"
						destructive
						pending={action.isPending}
						error={error}
						onConfirm={() => run({ kind: "suspend" })}
						onBack={() => (setError(""), setStep(null))}
					/>
				) : step === "unsuspend" ? (
					<ConfirmStep
						title={`Reinstate ${fullName(user)}?`}
						description="They'll be able to sign in and use Gwani again."
						confirmLabel="Reinstate"
						pending={action.isPending}
						error={error}
						onConfirm={() => run({ kind: "unsuspend" })}
						onBack={() => (setError(""), setStep(null))}
					/>
				) : step === "promote" ? (
					<ConfirmStep
						title={`Make ${fullName(user)} an admin?`}
						description="They'll get full access to this console — users, jobs, disputes and the audit log."
						confirmLabel="Make admin"
						pending={action.isPending}
						error={error}
						onConfirm={() => run({ kind: "promote" })}
						onBack={() => (setError(""), setStep(null))}
					/>
				) : step === "demote" ? (
					<div className="flex flex-col gap-5">
						<label className="flex flex-col gap-1.5">
							<span className="text-b3 font-medium text-foreground lg:text-b1">Change their role to</span>
							<Select value={demoteTo} onChange={(event) => setDemoteTo(event.target.value as Exclude<UserRole, "ADMIN">)} className="h-11">
								<option value="CLIENT">Client</option>
								<option value="PROVIDER">Provider</option>
							</Select>
						</label>
						<ConfirmStep
							title={`Remove ${fullName(user)}'s admin role?`}
							description="They'll lose access to this console and become a regular account."
							confirmLabel="Remove admin role"
							destructive
							pending={action.isPending}
							error={error}
							onConfirm={() => run({ kind: "demote", role: demoteTo })}
							onBack={() => (setError(""), setStep(null))}
						/>
					</div>
				) : (
					<ConfirmStep
						title={`Erase ${fullName(user)}'s personal data?`}
						description="Their name, email and password are anonymised and the account is closed. The record stays (pseudonymised) for audit and payment history. This can't be undone."
						confirmLabel="Erase data"
						destructive
						pending={action.isPending}
						error={error}
						typeToConfirm={user.email}
						onConfirm={() => run({ kind: "erase" })}
						onBack={() => (setError(""), setStep(null))}
					/>
				)}

				{step === null && !erased && (
					<div className="flex justify-end">
						<Button type="button" variant="outline" size="large" className="sm:px-8" onClick={() => onOpenChange(false)}>
							Close
						</Button>
					</div>
				)}
			</div>
		</AdminDialog>
	);
}

export { UserDialog };
