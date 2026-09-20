"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, UserSearch } from "lucide-react";
import { Button } from "@repo/ui/button";
import { EmptyState } from "@repo/ui/empty-state";
import { Pagination } from "@repo/ui/pagination";
import { toast } from "@repo/ui/sonner";
import { FilterPill } from "@/features/dashboard/components/client/providers/FilterPill";
import { ProviderCard } from "@/features/dashboard/components/client/providers/ProviderCard";
import { CATEGORY_OPTIONS, LOCATION_OPTIONS, MOCK_PROVIDERS, RATING_OPTIONS } from "@/lib/mock/providers";

const PAGE_SIZE = 6;

const LOCATIONS = LOCATION_OPTIONS.map((place) => ({ value: place, label: place }));
const RATINGS = RATING_OPTIONS.map((option) => ({ value: String(option.value), label: option.label }));

/**
 * Client-side provider search: a text box plus category / location / rating
 * chips, filtering a mock list of 128 as you type. Text matches name, trade and
 * location. The trailing "Filter" chip is for filters that aren't designed yet
 * (it says so). The results count is visible on phones only, as in the mocks,
 * and announced to screen readers everywhere. Real data would come from
 * `GET /providers/discover` (which takes skill/location/rating filters — not
 * checked against the spec yet).
 */
function FindProvidersView() {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("");
	const [location, setLocation] = useState("");
	const [rating, setRating] = useState("");
	const [page, setPage] = useState(1);

	const needle = query.trim().toLowerCase();
	const matching = MOCK_PROVIDERS.filter(
		(provider) =>
			(!needle ||
				provider.name.toLowerCase().includes(needle) ||
				provider.headline.toLowerCase().includes(needle) ||
				provider.location.toLowerCase().includes(needle)) &&
			(!category || provider.category === category) &&
			(!location || provider.location === location) &&
			(!rating || provider.rating >= Number(rating)),
	);
	const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
	const start = (page - 1) * PAGE_SIZE;
	const providers = matching.slice(start, start + PAGE_SIZE);
	const filtered = Boolean(needle || category || location || rating);

	// Any change to what's being searched goes back to the first page.
	function update<T>(set: (value: T) => void) {
		return (value: T) => {
			set(value);
			setPage(1);
		};
	}

	function clearAll() {
		setQuery("");
		setCategory("");
		setLocation("");
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
					<span className="sr-only">Search by skill, location or provider name</span>
					<Search
						className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500"
						aria-hidden="true"
					/>
					<input
						type="search"
						value={query}
						onChange={(event) => update(setQuery)(event.target.value)}
						placeholder="Search providers…"
						className="h-13 w-full rounded-2xl border border-neutral-300 bg-white pr-4 pl-12 text-b3 text-foreground outline-none placeholder:text-neutral-500 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200 md:h-12 md:rounded-xl md:max-w-md md:placeholder:text-transparent"
					/>
					{/* The longer prompt fits on desktop only. */}
					{!query && (
						<span
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-12 hidden -translate-y-1/2 text-b3 text-neutral-500 md:block"
						>
							Search by skill, location or provider name…
						</span>
					)}
				</label>
				<Button type="submit" size="large" iconOnly className="hidden size-12 shrink-0 rounded-lg md:inline-flex" aria-label="Search">
					<Search className="size-5" aria-hidden="true" />
				</Button>
			</form>

			<div className="flex flex-wrap items-center gap-3">
				<FilterPill
					label="Category"
					placeholder="All Categories"
					value={category}
					onChange={update(setCategory)}
					options={CATEGORY_OPTIONS}
					alwaysActive
				/>
				<FilterPill label="Location" placeholder="Location" value={location} onChange={update(setLocation)} options={LOCATIONS} />
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
				{matching.length} {matching.length === 1 ? "provider" : "providers"} found
			</p>

			{providers.length === 0 ? (
				<EmptyState
					icon={UserSearch}
					title="No providers found"
					description="Try a different search, or clear the filters."
					action={
						filtered && (
							<Button type="button" variant="outline" size="medium" onClick={clearAll}>
								Clear filters
							</Button>
						)
					}
				/>
			) : (
				<ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-7.5">
					{providers.map((provider) => (
						<li key={provider.id} className="flex">
							<ProviderCard provider={provider} />
						</li>
					))}
				</ul>
			)}

			{matching.length > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-c1 text-neutral-500 lg:text-b3">
						Showing {providers.length} of {matching.length} entries
					</p>
					<Pagination page={page} pageCount={pageCount} onPageChange={changePage} />
				</div>
			)}
		</div>
	);
}

export { FindProvidersView };
