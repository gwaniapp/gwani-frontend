"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Trash2, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@repo/ui/dialog";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications } from "@/features/notifications/hooks/useNotifications";
import { formatDate, formatTime } from "@/lib/format";
import { isUnread, notificationJobId, notificationText, notificationTitle } from "@/lib/notifications";
import type { AppNotification } from "@/lib/api/types";

const ENTER = "data-[state=open]:duration-300 data-[state=open]:ease-out";
const EXIT = "data-[state=closed]:duration-200 data-[state=closed]:ease-in";

/**
 * The bell in the header: a badge with how many notifications are unread, and a panel that slides in
 * from the right with the inbox (`GET /notifications`). Tapping one marks it read (`PATCH …/read`) and,
 * when it's about a job, opens that job; each can be deleted, and "Mark all as read" clears the badge.
 */
function NotificationBell({ role, className }: { role: "client" | "provider"; className?: string }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const notifications = useNotifications();
	const markRead = useMarkRead();
	const markAll = useMarkAllRead();
	const remove = useDeleteNotification();

	const items = notifications.data ?? [];
	const unread = items.filter(isUnread).length;

	function openItem(item: AppNotification) {
		if (isUnread(item)) markRead.mutate(item.id);
		const jobId = notificationJobId(item);
		if (jobId) {
			setOpen(false);
			router.push(`/${role}/dashboard/jobs/${jobId}`);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					type="button"
					aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
					className={cn(
						"relative flex shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-300",
						className,
					)}
				>
					<Bell className="size-5" aria-hidden="true" />
					{unread > 0 && (
						<span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-c3 text-white">{unread > 9 ? "9+" : unread}</span>
					)}
				</button>
			</DialogTrigger>
			<DialogContent
				showCloseButton={false}
				aria-describedby={undefined}
				overlayClassName={`${ENTER} ${EXIT}`}
				className={`top-0 right-0 left-auto flex h-dvh max-h-none w-[min(26rem,100vw)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 shadow-2xl sm:max-w-none sm:rounded-l-3xl sm:p-0 data-[state=open]:zoom-in-100 data-[state=open]:fade-in-100 data-[state=open]:slide-in-from-right data-[state=closed]:zoom-out-100 data-[state=closed]:fade-out-100 data-[state=closed]:slide-out-to-right ${ENTER} ${EXIT}`}
			>
				<div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-5">
					<div className="flex flex-col gap-1">
						<DialogTitle className="text-xl font-medium">Notifications</DialogTitle>
						<DialogDescription className="text-b3">{unread > 0 ? `${unread} unread` : "You're all caught up."}</DialogDescription>
					</div>
					<DialogClose aria-label="Close" className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-neutral-600 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary-200">
						<X className="size-5" aria-hidden="true" />
					</DialogClose>
				</div>

				{unread > 0 && (
					<div className="shrink-0 border-b border-border px-5 py-2.5">
						<Button type="button" variant="ghost" size="medium" loading={markAll.isPending} onClick={() => markAll.mutate(items)} className="px-0 text-primary-500 hover:bg-transparent hover:underline">
							Mark all as read
						</Button>
					</div>
				)}

				<div className="min-h-0 flex-1 overflow-y-auto">
					{notifications.isPending ? (
						<div className="flex flex-col gap-3 p-5" aria-busy="true" aria-label="Loading notifications">
							{[0, 1, 2].map((row) => (
								<Skeleton key={row} className="h-20 w-full rounded-xl" />
							))}
						</div>
					) : notifications.isError ? (
						<div role="alert" className="flex flex-col items-start gap-3 p-5">
							<p className="text-b3 text-danger-600">We couldn&apos;t load your notifications.</p>
							<Button type="button" variant="outline" size="medium" onClick={() => void notifications.refetch()}>
								Try again
							</Button>
						</div>
					) : items.length === 0 ? (
						<div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
							<span className="flex size-14 items-center justify-center rounded-full bg-muted text-neutral-500">
								<BellOff className="size-6" aria-hidden="true" />
							</span>
							<p className="text-b1 font-medium text-foreground">No notifications yet</p>
							<p className="text-b3 text-neutral-500">Updates about your jobs and payments will show up here.</p>
						</div>
					) : (
						<ul className="flex flex-col">
							{items.map((item) => {
								const text = notificationText(item);
								return (
									<li key={item.id} className={cn("group flex items-start gap-3 border-b border-border px-5 py-4", isUnread(item) && "bg-primary-100/20")}>
										<span aria-hidden="true" className={cn("mt-2 size-2 shrink-0 rounded-full", isUnread(item) ? "bg-primary-500" : "bg-transparent")} />
										<button type="button" onClick={() => openItem(item)} className="flex min-w-0 flex-1 flex-col gap-1 text-left outline-none focus-visible:underline">
											<span className={cn("text-b3 break-words text-foreground", isUnread(item) && "font-medium")}>{notificationTitle(item)}</span>
											{text && <span className="text-b3 break-words text-neutral-600">{text}</span>}
											<span className="text-c1 text-neutral-500">
												{formatDate(item.created_at)}, {formatTime(item.created_at)}
											</span>
										</button>
										<button
											type="button"
											aria-label="Delete notification"
											disabled={remove.isPending}
											onClick={() => remove.mutate(item.id)}
											className="flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 outline-none transition-colors hover:bg-muted hover:text-danger-600 focus-visible:ring-2 focus-visible:ring-primary-300"
										>
											<Trash2 className="size-4" aria-hidden="true" />
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { NotificationBell };
