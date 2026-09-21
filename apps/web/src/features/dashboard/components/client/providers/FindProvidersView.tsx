"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, UserSearch } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Pagination } from "@repo/ui/pagination";
import { Skeleton } from "@repo/ui/skeleton";
import { toast } from "@repo/ui/sonner";
import { QueryError } from "@/components/QueryState";
import { FilterPill } from "@/features/dashboard/components/client/providers/FilterPill";
import { ProviderCard } from "@/features/dashboard/components/client/providers/ProviderCard";
import { PROVIDERS_PAGE_SIZE, useProviderSearch } from "@/features/providers/hooks/useProviders";
import { useSkills } from "@/features/provider/hooks/useProviderProfile";
import { COUNTRIES } from "@/lib/mock/locations";

const COUNTRY_OPTIONS = COUNTRIES.map(([code, name]) => ({ value: code, label: name }));
const RATINGS = [
	{ value: "4.5", label: "4.5 & up" },
	{ value: "4", label: "4.0 & up" },
	{ value: "3.5", label: "3.5 & up" },
];

/** The text box waits for a pause in typing before it searches, so each keystroke isn't a request. */
function useDebounced(value: string, ms = 350) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), ms);
		return () => clearTimeout(timer);
	}, [value, ms]);
	return debounced;
}

/**
 * Provider search on the real directory (`GET /providers/discover`, see
 * `useProviderSearch`): a text box (matches skills and city — the backend can't search names), a
 * skill chip (the backend's skill catalog), a country chip and a minimum-rating
 * chip. Filters and paging are server-side; any change goes back to page 1. The
 * results count is visible on phones only (as in the mocks) and announced to
 * screen readers everywhere. The trailing "Filter" chip has no design — it says
 * so.
 */
function FindProvidersView({ initialQuery = "" }: { initialQuery?: string }) {
	const [query, setQuery] = useState(initialQuery);
	const [skill, setSkill] = useState("");
	const [country, setCountry] = useState("");
	const [rating, setRating] = useState("");
	const [page, setPage] = useState(1);

	const text = useDebounced(query);
	const skills = useSkills();
	const results = useProviderSearch({ text, skill, country, minRating: rating, page });

	const skillOptions = (skills.data ?? []).map((item) => ({ value: item.slug, label: item.name }));
	const total = results.data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PROVIDERS_PAGE_SIZE));
	const items = results.data?.items ?? [];
	const filtered = Boolean(query.trim() || skill || country || rating);

	// Any change to what's being searched goes back to the first page.
	function update<T>(set: (value: T) => void) {
		return (value: T) => {
			set(value);
			setPage(1);
		};
	}

	function clearAll() {
		setQuery("");
		setSkill("");
		setCountry("");
		setRating("");
		setPage(1);
	}

	function changePage(next: number) {
		setPage(next);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	return (
		<div className="flex flex-col gap-6 lg:gap-8">
			<h1 className="sr-only lg:not-sr-only lg:text-h4 2xl:text-h3 lg:font-medium lg:text-foreground">Find Providers</h1>

			<form
				role="search"
				onSubmit={(event) => event.preventDefault()}
				className="flex gap-3 md:rounded-2xl md:border md:border-border md:bg-white md:p-4 md:shadow-[0_4px_24px_rgb(0_0_0/0.04)]"
			>
				<label className="relative flex-1">
					<span className="sr-only">Search by skill or city</span>
					<Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
					<input
						type="search"
						value={query}
						onChange={(event) => update(setQuery)(event.target.value)}
						placeholder="Search by skill or city…"
						className="h-13 w-full rounded-2xl border border-neutral-300 bg-white pr-4 pl-12 text-b3 text-foreground outline-none placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200 md:h-12 md:max-w-md md:rounded-xl md:placeholder:text-transparent"
					/>
					{/* The longer prompt fits on desktop only. */}
					{!query && (
						<span
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-12 hidden -translate-y-1/2 text-b3 text-neutral-500 md:block"
						>
							Search by skill or city…
						</span>
					)}
				</label>
				<Button type="submit" size="large" iconOnly className="hidden size-12 shrink-0 rounded-lg md:inline-flex" aria-label="Search">
					<Search className="size-5" aria-hidden="true" />
				</Button>
			</form>

			<div className="flex flex-wrap items-center gap-3">
				<FilterPill label="Skill" placeholder="All Skills" value={skill} onChange={update(setSkill)} options={skillOptions} alwaysActive />
				<FilterPill label="Country" placeholder="Location" value={country} onChange={update(setCountry)} options={COUNTRY_OPTIONS} />
				<FilterPill label="Minimum rating" placeholder="Rating" value={rating} onChange={update(setRating)} options={RATINGS} />
				<button
					type="button"
					onClick={() => toast.info("More filters are coming soon.")}
					className="ml-auto inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-b3 text-neutral-500 outline-none transition-colors hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-primary-200 md:h-11 md:px-5"
				>
					<SlidersHorizontal className="size-4" aria-hidden="true" />
					Filter
				</button>
			</div>

			<p aria-live="polite" className="text-b1 text-neutral-500 lg:sr-only">
				{results.data ? `${total} ${total === 1 ? "provider" : "providers"} found` : " "}
			</p>

			{results.isPending ? (
				<ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-7.5" aria-busy="true" aria-label="Loading providers">
					{Array.from({ length: PROVIDERS_PAGE_SIZE }, (_, index) => (
						<li key={index}>
							<Skeleton className="h-52 w-full rounded-3xl" />
						</li>
					))}
				</ul>
			) : results.isError ? (
				<QueryError message="We couldn't load providers." onRetry={() => void results.refetch()} />
			) : items.length === 0 ? (
				<EmptyState
					icon={UserSearch}
					title="No providers found"
					description={filtered ? "Try a different search, or clear the filters." : "No providers have joined yet. Check back soon."}
					action={
						filtered && (
							<Button type="button" variant="outline" size="medium" onClick={clearAll}>
								Clear filters
							</Button>
						)
					}
				/>
			) : (
				<ul
					className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 lg:gap-7.5 ${results.isPlaceholderData ? "opacity-60" : ""}`}
				>
					{items.map((provider) => (
						<li key={provider.id} className="flex">
							<ProviderCard provider={provider} />
						</li>
					))}
				</ul>
			)}

			{items.length > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-c1 text-neutral-500 lg:text-b3">
						Showing {items.length} of {total} entries
					</p>
					<Pagination page={page} pageCount={pageCount} onPageChange={changePage} />
				</div>
			)}
		</div>
	);
}

export { FindProvidersView };
