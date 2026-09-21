"use client";

import { useState } from "react";
import { UserSearch } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { RoleBadge, UserStatusBadge } from "@/components/Badges";
import { TableFrame, Td, Th } from "@/components/DataTable";
import { FilterSelect, SearchBox } from "@/components/Filters";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { QueryError } from "@/components/QueryState";
import { UserDialog } from "@/features/admin/components/UserDialog";
import { USERS_PAGE_SIZE, useAdminUsers } from "@/features/admin/hooks/useAdminData";
import { useDebounced } from "@/hooks/useDebounced";
import { formatDate } from "@/lib/format";
import { fullName } from "@/lib/labels";
import type { AdminUser } from "@/lib/api/types";

const ROLES = [
	{ value: "CLIENT", label: "Clients" },
	{ value: "PROVIDER", label: "Providers" },
	{ value: "ADMIN", label: "Admins" },
];
const STATUSES = [
	{ value: "false", label: "Active" },
	{ value: "true", label: "Suspended" },
];

/** A user the backend has erased keeps its row (pseudonymised) but can no longer be acted on. */
export const isErased = (user: AdminUser) => Boolean(user.deleted_at);

/**
 * Users: search (email or name), filter by role and by suspended, page through them — all on the
 * server (`GET /admin/users`). "Manage" opens a dialog with the details and the account actions
 * (suspend / reinstate, promote / demote, export data, erase data).
 */
function UsersView() {
	const [query, setQuery] = useState("");
	const [role, setRole] = useState("");
	const [suspended, setSuspended] = useState("");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<AdminUser | null>(null);

	const search = useDebounced(query);
	const users = useAdminUsers({ query: search, role, suspended, page });

	const total = users.data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
	const rows = users.data?.items ?? [];
	const filtered = Boolean(query.trim() || role || suspended);

	function change<T>(set: (value: T) => void) {
		return (value: T) => {
			set(value);
			setPage(1);
		};
	}

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<PageHeader title="Users" description="Everyone with a Gwani account. Search, review and manage accounts." />

			<Panel className="flex flex-wrap items-end gap-4 p-4 lg:p-5">
				<SearchBox label="Search" value={query} onChange={change(setQuery)} placeholder="Email or name" />
				<FilterSelect label="Role" value={role} onChange={change(setRole)} allLabel="All roles" options={ROLES} />
				<FilterSelect label="Status" value={suspended} onChange={change(setSuspended)} allLabel="Any status" options={STATUSES} />
			</Panel>

			<p aria-live="polite" className="-mb-3 text-b3 text-neutral-500">
				{users.data ? `${total.toLocaleString("en")} ${total === 1 ? "user" : "users"}` : " "}
			</p>

			{users.isPending ? (
				<div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading users">
					{[0, 1, 2, 3, 4].map((row) => (
						<Skeleton key={row} className="h-14 w-full rounded-xl" />
					))}
				</div>
			) : users.isError ? (
				<QueryError message="We couldn't load users." onRetry={() => void users.refetch()} />
			) : rows.length === 0 ? (
				<Panel className="py-6">
					<EmptyState icon={UserSearch} title="No users found" description={filtered ? "Try a different search or clear the filters." : "No one has signed up yet."} />
				</Panel>
			) : (
				<div className={users.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
					<TableFrame>
						<thead>
							<tr>
								<Th>User</Th>
								<Th>Role</Th>
								<Th>Status</Th>
								<Th>Joined</Th>
								<Th className="text-right">
									<span className="sr-only">Actions</span>
								</Th>
							</tr>
						</thead>
						<tbody>
							{rows.map((user) => (
								<tr key={user.id} className="hover:bg-muted/40">
									<Td className="max-w-72">
										<p className="truncate font-medium">{fullName(user)}</p>
										<p className="truncate text-c1 text-neutral-500 lg:text-b3">{user.email}</p>
									</Td>
									<Td>
										<RoleBadge role={user.role} />
									</Td>
									<Td>
										<UserStatusBadge suspended={user.suspended} erased={isErased(user)} />
									</Td>
									<Td className="whitespace-nowrap">{formatDate(user.created_at)}</Td>
									<Td className="text-right">
										<Button type="button" variant="outline" size="medium" onClick={() => setSelected(user)}>
											Manage
										</Button>
									</Td>
								</tr>
							))}
						</tbody>
					</TableFrame>
				</div>
			)}

			{rows.length > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-c1 text-neutral-500 lg:text-b3">
						Showing {rows.length} of {total.toLocaleString("en")} entries
					</p>
					<Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
				</div>
			)}

			{selected && <UserDialog key={selected.id} user={selected} open onOpenChange={(open) => !open && setSelected(null)} />}
		</div>
	);
}

export { UsersView };
