"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, FileText, Search, UserSearch, type LucideIcon } from "lucide-react";
import { JobStatusBadge } from "@repo/ui/job-status-badge";
import { cn } from "@repo/ui/lib/utils";
import { DASHBOARD_CONFIG, type DashboardRole } from "@/features/dashboard/config";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { logAction } from "@/lib/logger";
import type { JobStatus } from "@/lib/api/types";

interface Result {
	key: string;
	group: "Pages" | "Jobs" | "Providers";
	label: string;
	href: string;
	icon: LucideIcon;
	status?: JobStatus;
}

const MAX_PER_GROUP = 5;
const includes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle);

/**
 * The header's search box, for both dashboards. Typing opens a list of matches —
 * the dashboard's own pages, and the person's jobs by title (from the same job
 * list the Jobs pages use, fetched only once something is typed) — and, for
 * clients, a row that carries the text over to Find Providers (the directory is
 * searched by the server, by skill or city). Arrow keys move through the list,
 * Enter opens the highlighted row (with nothing highlighted: the first job or
 * page match, or the provider search for a client), Escape closes it.
 */
function HeaderSearch({ role }: { role: DashboardRole }) {
	const router = useRouter();
	const listId = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);

	const text = query.trim().toLowerCase();
	const jobs = useJobs(role, { enabled: text.length > 0 });
	const { home, menu, general } = DASHBOARD_CONFIG[role];

	const results = useMemo<Result[]>(() => {
		if (!text) return [];
		const pages: Result[] = [...menu, ...general]
			.filter((item) => includes(item.label, text))
			.slice(0, MAX_PER_GROUP)
			.map((item) => ({ key: `page:${item.href}`, group: "Pages", label: item.label, href: item.href, icon: FileText }));
		const found: Result[] = (jobs.data ?? [])
			.filter((job) => includes(job.title, text) || includes(job.status.replace(/_/g, " "), text))
			.slice(0, MAX_PER_GROUP)
			.map((job) => ({ key: `job:${job.id}`, group: "Jobs", label: job.title, href: `${home}/jobs/${job.id}`, icon: Briefcase, status: job.status }));
		const providers: Result[] =
			role === "client"
				? [{ key: "providers", group: "Providers", label: `Find providers for “${query.trim()}”`, href: `${home}/providers?q=${encodeURIComponent(query.trim())}`, icon: UserSearch }]
				: [];
		return [...found, ...pages, ...providers];
	}, [text, query, jobs.data, menu, general, home, role]);

	function close() {
		setOpen(false);
		setActive(-1);
	}

	function go(result: Result) {
		logAction("dashboard.search", "info", { query: query.trim(), group: result.group, to: result.href });
		close();
		setQuery("");
		inputRef.current?.blur();
		router.push(result.href);
	}

	function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			if (open) event.preventDefault();
			close();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			if (results.length === 0) return;
			event.preventDefault();
			setOpen(true);
			const step = event.key === "ArrowDown" ? 1 : -1;
			setActive((current) => {
				const next = current + step;
				return next < 0 ? results.length - 1 : next >= results.length ? 0 : next;
			});
			return;
		}
		if (event.key === "Enter") {
			event.preventDefault();
			const chosen = results[active] ?? results[0];
			if (chosen) go(chosen);
		}
	}

	const showList = open && text.length > 0;
	const searching = jobs.isFetching && !jobs.data;
	let lastGroup = "";

	return (
		<div
			ref={rootRef}
			role="search"
			className="relative flex-1"
			onBlur={(event) => {
				if (!rootRef.current?.contains(event.relatedTarget)) close();
			}}
		>
			<label className="relative block">
				<span className="sr-only">Search jobs and pages</span>
				<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
				<input
					ref={inputRef}
					type="search"
					role="combobox"
					aria-expanded={showList}
					aria-controls={listId}
					aria-autocomplete="list"
					aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
					autoComplete="off"
					value={query}
					onChange={(event) => {
						setQuery(event.target.value);
						setOpen(true);
						setActive(-1);
					}}
					onFocus={() => setOpen(true)}
					onKeyDown={onKeyDown}
					placeholder={role === "client" ? "Search jobs, pages or providers" : "Search jobs or pages"}
					className="h-12 w-full rounded-lg bg-muted pr-4 pl-11 text-b3 text-foreground outline-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-primary-300"
				/>
			</label>

			{showList && (
				<ul
					id={listId}
					role="listbox"
					aria-label="Search results"
					className="absolute top-full right-0 left-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-[0_8px_32px_rgb(0_0_0/0.10)]"
				>
					{results.map((result, index) => {
						const header = result.group !== lastGroup;
						lastGroup = result.group;
						const Icon = result.icon;
						return (
							<li key={result.key} role="presentation">
								{header && <p className="px-3 pt-2 pb-1 text-c1 text-neutral-500">{result.group}</p>}
								<button
									type="button"
									role="option"
									id={`${listId}-${index}`}
									aria-selected={index === active}
									// Keeps focus in the input, so the click lands before the blur closes the list.
									onMouseDown={(event) => event.preventDefault()}
									onMouseEnter={() => setActive(index)}
									onClick={() => go(result)}
									className={cn(
										"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-b3 text-foreground outline-none",
										index === active ? "bg-primary-100/60" : "hover:bg-muted",
									)}
								>
									<Icon className="size-4 shrink-0 text-neutral-500" aria-hidden="true" />
									<span className="min-w-0 flex-1 truncate">{result.label}</span>
									{result.status && <JobStatusBadge status={result.status} className="px-3 py-0.5 text-c1" />}
								</button>
							</li>
						);
					})}
					{searching && (
						<li role="presentation" className="px-3 py-2.5 text-b3 text-neutral-500">
							Searching your jobs…
						</li>
					)}
					{!searching && results.length === 0 && (
						<li role="presentation" className="px-3 py-2.5 text-b3 text-neutral-500">
							{jobs.isError ? "We couldn't search your jobs right now." : `No matches for “${query.trim()}”.`}
						</li>
					)}
				</ul>
			)}
		</div>
	);
}

export { HeaderSearch };
