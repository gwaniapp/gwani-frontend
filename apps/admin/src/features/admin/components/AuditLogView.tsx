"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Skeleton } from "@repo/ui/skeleton";
import { TableFrame, Td, Th } from "@/components/DataTable";
import { FilterSelect, SearchBox } from "@/components/Filters";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { QueryError } from "@/components/QueryState";
import { IdValue } from "@/components/CopyButton";
import { AUDIT_PAGE_SIZE, useAuditLog } from "@/features/admin/hooks/useAdminData";
import { useDebounced } from "@/hooks/useDebounced";
import { formatDate, formatTime } from "@/lib/format";
import { statusLabel } from "@/lib/labels";

const TARGETS = [
	{ value: "user", label: "Users" },
	{ value: "job", label: "Jobs" },
];

/** A compact one-line view of an entry's extra details (e.g. `{ to: "PAID", note: "…" }`). */
function details(metadata: Record<string, unknown> | null | undefined) {
	if (!metadata || Object.keys(metadata).length === 0) return "";
	return Object.entries(metadata)
		.map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
		.join(" · ");
}

/**
 * The audit log (`GET /admin/audit-log`): every admin action — suspend, unsuspend, promote, demote,
 * erase, export, force_transition — with who did it and to what, newest first. Filter by action and
 * by target type; the endpoint pages with limit/offset and reports no total, so there's Previous /
 * Next rather than page numbers.
 */
function AuditLogView() {
	const [action, setAction] = useState("");
	const [targetType, setTargetType] = useState("");
	const [page, setPage] = useState(1);
	const search = useDebounced(action);
	const log = useAuditLog({ action: search, targetType, page });
	const rows = log.data ?? [];

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<PageHeader title="Audit log" description="A record of everything admins have done." />

			<Panel className="flex flex-wrap items-end gap-4 p-4 lg:p-5">
				<SearchBox
					label="Action"
					value={action}
					onChange={(value) => {
						setAction(value);
						setPage(1);
					}}
					placeholder="e.g. suspend, erase, force_transition"
				/>
				<FilterSelect
					label="Target"
					value={targetType}
					onChange={(value) => {
						setTargetType(value);
						setPage(1);
					}}
					allLabel="Everything"
					options={TARGETS}
				/>
			</Panel>

			{log.isPending ? (
				<div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading the audit log">
					{[0, 1, 2, 3, 4].map((row) => (
						<Skeleton key={row} className="h-14 w-full rounded-xl" />
					))}
				</div>
			) : log.isError ? (
				<QueryError message="We couldn't load the audit log." onRetry={() => void log.refetch()} />
			) : rows.length === 0 ? (
				<Panel className="py-6">
					<EmptyState icon={ScrollText} title="Nothing here" description={action || targetType ? "No entries match those filters." : "No admin actions have been recorded yet."} />
				</Panel>
			) : (
				<div className={log.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
					<TableFrame>
						<thead>
							<tr>
								<Th>When</Th>
								<Th>Action</Th>
								<Th>Target</Th>
								<Th>By</Th>
								<Th>Details</Th>
							</tr>
						</thead>
						<tbody>
							{rows.map((entry) => (
								<tr key={entry.id} className="hover:bg-muted/40">
									<Td className="whitespace-nowrap">
										{formatDate(entry.created_at)}
										<span className="text-neutral-500">, {formatTime(entry.created_at)}</span>
									</Td>
									<Td className="whitespace-nowrap font-medium">{statusLabel(entry.action)}</Td>
									<Td className="max-w-56">
										<p className="text-c1 text-neutral-500 lg:text-b3">{entry.target_type ? statusLabel(entry.target_type) : "—"}</p>
										{entry.target_id && <IdValue value={entry.target_id} label="Target id" />}
									</Td>
									<Td className="max-w-44">{entry.actor_user_id ? <IdValue value={entry.actor_user_id} label="Admin id" /> : "—"}</Td>
									<Td className="max-w-96 text-c1 break-words text-neutral-600 lg:text-b3">{details(entry.metadata) || "—"}</Td>
								</tr>
							))}
						</tbody>
					</TableFrame>
				</div>
			)}

			{(page > 1 || rows.length === AUDIT_PAGE_SIZE) && (
				<div className="flex items-center justify-between gap-3">
					<Button type="button" variant="outline" size="medium" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
						<ChevronLeft className="size-4" aria-hidden="true" />
						Previous
					</Button>
					<span className="text-b3 text-neutral-500">Page {page}</span>
					<Button type="button" variant="outline" size="medium" disabled={rows.length < AUDIT_PAGE_SIZE} onClick={() => setPage((current) => current + 1)}>
						Next
						<ChevronRight className="size-4" aria-hidden="true" />
					</Button>
				</div>
			)}
		</div>
	);
}

export { AuditLogView };
