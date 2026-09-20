"use client";

import { Switch } from "@repo/ui/switch";
import type { DashboardRole } from "@/features/dashboard/config";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useNotificationPrefsStore } from "@/lib/stores/notificationPrefsStore";

interface NotificationOption {
	id: string;
	label: string;
	description: string;
	defaultOn: boolean;
	roles: DashboardRole[];
}

/**
 * Email notifications worth choosing between. Security and account emails
 * (verification codes, password resets) aren't listed because they can't be
 * switched off. The set differs by role; the wording follows the job flow
 * (selected → funded → in progress → completed → paid).
 */
const NOTIFICATION_OPTIONS: NotificationOption[] = [
	{
		id: "job-requests",
		label: "New job requests",
		description: "When a client picks you for a job.",
		defaultOn: true,
		roles: ["provider"],
	},
	{
		id: "job-updates",
		label: "Job updates",
		description: "When the status of one of your jobs changes.",
		defaultOn: true,
		roles: ["provider", "client"],
	},
	{
		id: "work-completed",
		label: "Work ready to review",
		description: "When a provider marks a job as completed and needs your confirmation.",
		defaultOn: true,
		roles: ["client"],
	},
	{
		id: "payments",
		label: "Payments",
		description: "When escrow is funded or a payment is released.",
		defaultOn: true,
		roles: ["provider", "client"],
	},
	{
		id: "news",
		label: "Tips and product news",
		description: "Occasional updates about Gwani. No spam.",
		defaultOn: false,
		roles: ["provider", "client"],
	},
];

/**
 * Notification switches. Remembered in this browser only
 * (`notificationPrefsStore`) — the backend has no preferences endpoint yet.
 */
function NotificationPrefs({ role }: { role: DashboardRole }) {
	const hydrated = useStoreHydrated(useNotificationPrefsStore.persist);
	const overrides = useNotificationPrefsStore((state) => state.overrides);
	const setPref = useNotificationPrefsStore((state) => state.set);

	return (
		<ul className="flex flex-col divide-y divide-border">
			{NOTIFICATION_OPTIONS.filter((option) => option.roles.includes(role)).map((option) => {
				const checked = hydrated ? (overrides[option.id] ?? option.defaultOn) : option.defaultOn;
				const labelId = `pref-${option.id}`;
				return (
					<li key={option.id} className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
						<div className="flex min-w-0 flex-col gap-0.5">
							<p id={labelId} className="text-b2 text-foreground lg:text-b1">
								{option.label}
							</p>
							<p className="text-c1 text-neutral-500 lg:text-b3">{option.description}</p>
						</div>
						<Switch aria-labelledby={labelId} checked={checked} onCheckedChange={(next) => setPref(option.id, next)} />
					</li>
				);
			})}
		</ul>
	);
}

export { NotificationPrefs };
