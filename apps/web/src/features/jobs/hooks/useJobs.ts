import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/sonner";
import { WALLET_KEY } from "@/features/provider/hooks/useWallet";
import { getApiErrorMessage } from "@/lib/api/errorMessage";
import { apiRoutes } from "@/lib/config/apiRoutes";
import { axiosAuth } from "@/lib/config/axios";
import { ACTIVE_STATUSES } from "@/lib/jobs";
import type { ApiSuccessResponse, Job, JobStateTransition } from "@/lib/api/types";

type Perspective = "provider" | "client";

const JOBS_KEY = ["jobs"] as const;
const jobsKey = (perspective: Perspective) => [...JOBS_KEY, "list", perspective] as const;
const jobKey = (id: string) => [...JOBS_KEY, "detail", id] as const;
const transitionsKey = (id: string) => [...JOBS_KEY, "transitions", id] as const;

const PAGE_SIZE = 50;
const MAX_PAGES = 10;

/** One row of the dashboard job lists (both roles); the fields that differ by side are optional. */
interface DashboardJobItem {
	id: string;
	title: string;
	status: Job["status"];
	price_amount: string;
	price_asset: string;
	skill_category?: string | null;
	due_date?: string | null;
	created_at: string;
	client?: Job["client"];
	provider?: Job["provider"];
	location?: Job["location"];
}

/**
 * Every job the signed-in user has on this side, newest first, from the
 * dashboard job lists — `GET /providers/provider/dashboard/jobs` (a provider's
 * assigned jobs, each with its **client's name**) and `GET /jobs/client/dashboard/jobs`
 * (all of a client's jobs, each with the **assigned provider's name and location**,
 * `null` until one is chosen) — paged 50 at a time up to 10 pages. Rows are shaped
 * like a `Job` so the screens read them the same way (no `description` — it isn't in
 * the list). A provider with no profile yet gets a 404 from their endpoint, which is
 * just "no jobs". The list refreshes itself while any job is mid-flight, since escrow
 * funding and completion change status without the person doing anything.
 */
function useJobs(perspective: Perspective, { enabled = true, live = false }: { enabled?: boolean; live?: boolean } = {}) {
	return useQuery({
		queryKey: jobsKey(perspective),
		enabled,
		// `live` (the Wallet page): never served from cache, and re-fetched every 15s so payments show up as they happen.
		...(live ? { staleTime: 0, refetchOnMount: "always" as const } : {}),
		queryFn: async () => {
			const path = perspective === "provider" ? apiRoutes.providers.DASHBOARD_JOBS : apiRoutes.jobs.CLIENT_DASHBOARD_JOBS;
			const jobs: Job[] = [];
			try {
				for (let page = 1; page <= MAX_PAGES; page++) {
					const { data } = await axiosAuth.get<ApiSuccessResponse<{ items?: DashboardJobItem[]; next_page?: boolean }>>(path, { params: { page, page_size: PAGE_SIZE } });
					for (const item of data.data.items ?? []) {
						jobs.push({
							id: item.id,
							title: item.title,
							description: "",
							status: item.status,
							price_amount: item.price_amount,
							price_asset: item.price_asset,
							skill_category: item.skill_category,
							due_date: item.due_date,
							created_at: item.created_at,
							client: item.client,
							provider: item.provider,
							// A provider's own list repeats *their own* location on every row; only a client's rows say where the provider is.
							location: perspective === "client" ? item.location : undefined,
						});
					}
					if (!data.data.next_page) break;
				}
			} catch (error) {
				if (!(isAxiosError(error) && error.response?.status === 404)) throw error;
			}
			return jobs.sort((a, b) => b.created_at.localeCompare(a.created_at));
		},
		refetchInterval: (query) => (live ? 15_000 : query.state.data?.some((job) => ACTIVE_STATUSES.has(job.status)) ? 30_000 : false),
	});
}

/** `GET /jobs/{id}` — refreshes every 15s while the job is mid-flight (funding, working, awaiting release). */
function useJob(id: string) {
	return useQuery({
		queryKey: jobKey(id),
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<Job>>(apiRoutes.jobs.byId(id));
			return data.data;
		},
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status && (ACTIVE_STATUSES.has(status) || status === "COMPLETED") ? 15_000 : false;
		},
	});
}

/** `GET /jobs/{id}/transitions` — the audit trail: every status change with its timestamp. */
function useJobTransitions(id: string, status?: string) {
	return useQuery({
		queryKey: [...transitionsKey(id), status],
		queryFn: async () => {
			const { data } = await axiosAuth.get<ApiSuccessResponse<JobStateTransition[]>>(apiRoutes.jobs.byIdTransitions(id));
			return Array.isArray(data.data) ? data.data : [];
		},
	});
}

/** After anything that changes a job: refresh it, its history and every list that includes it — and the wallet, since funding/releasing escrow moves money. */
function refreshJobs(queryClient: QueryClient, id?: string) {
	void queryClient.invalidateQueries({ queryKey: JOBS_KEY });
	void queryClient.invalidateQueries({ queryKey: WALLET_KEY });
	if (id) void queryClient.invalidateQueries({ queryKey: jobKey(id) });
}

interface JobAction {
	/** Console/log name, `area.name`. */
	action: string;
	/** Backend path for the action on this job. */
	path: (id: string) => string;
	/** Wording for statuses the backend answers with 409 (the job isn't in the right state). */
	conflict: string;
	/** Extra per-status messages, e.g. 422 for insufficient wallet balance. */
	messages?: Partial<Record<number, string>>;
}

function isConflict(error: unknown) {
	return typeof error === "object" && error !== null && "response" in error && (error as { response?: { status?: number } }).response?.status === 409;
}

/** `POST /jobs/{id}/mark-completed` — the assigned provider says the work is done (IN_PROGRESS → COMPLETED). */
function useMarkCompleted(id: string) {
	return useJobActionFor(id, {
		action: "jobs.mark-completed",
		path: apiRoutes.jobs.byIdMarkCompleted,
		conflict: "This job isn't in progress any more, so it can't be marked as completed.",
		messages: { 403: "Only the provider assigned to this job can mark it as completed." },
	});
}

/** Shown when a money-moving call fails on the server: retrying blindly could move the money twice. */
const STUCK_PAYMENT =
	"We couldn't confirm this payment. It may already have gone through, so please check Recent Transactions on your Wallet page before trying again.";

/** `POST /jobs/{id}/escrow/fund` — the client locks the price into escrow (PROVIDER_SELECTED → FUNDED → IN_PROGRESS). */
function useFundEscrow(id: string) {
	return useJobActionFor(id, {
		action: "jobs.fund-escrow",
		path: apiRoutes.escrow.byJobIdFund,
		conflict: "This job isn't waiting for payment any more.",
		messages: {
			403: "Only the client who posted this job can fund it.",
			422: "Your wallet doesn't have enough balance, or isn't set up to hold this asset yet. Set up and fund your wallet, then try again.",
			// Observed live: the payment was sent to the network and then the server failed to record it, so it may already have left the wallet.
			500: STUCK_PAYMENT,
			502: STUCK_PAYMENT,
			504: STUCK_PAYMENT,
		},
	});
}

/** `POST /jobs/{id}/escrow/release` — the client pays the provider (COMPLETED → PAID). Irreversible. */
function useReleaseEscrow(id: string) {
	return useJobActionFor(id, {
		action: "jobs.release-escrow",
		path: apiRoutes.escrow.byJobIdRelease,
		conflict: "This job isn't ready for payment, or it's under dispute.",
		messages: { 403: "Only the client who posted this job can release the payment.", 500: STUCK_PAYMENT, 502: STUCK_PAYMENT, 504: STUCK_PAYMENT },
	});
}

/** `POST /jobs/{id}/dispute` — either party, on a COMPLETED job; freezes the release until an admin resolves it. */
function useDispute(id: string) {
	return useJobActionFor(id, {
		action: "jobs.dispute",
		path: apiRoutes.jobs.byIdDispute,
		conflict: "A dispute can only be raised on a completed job.",
		messages: { 403: "Only the client or the assigned provider can raise a dispute." },
	});
}

/**
 * One hook for every "POST to a job" action — completing, dispute, funding and
 * releasing escrow — so they behave the same: send, refresh the job and lists,
 * and turn the backend's state-machine errors (409 = the job isn't in the right
 * status any more, often because the other party just acted) into sentences via
 * `describe(error)`. The caller decides where to show it (dialogs keep it inline).
 */
function useJobActionFor(id: string, config: JobAction) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		meta: { action: config.action },
		mutationFn: async () => {
			const { data } = await axiosAuth.post<ApiSuccessResponse<unknown>>(config.path(id));
			return data.data;
		},
		onSuccess: () => refreshJobs(queryClient, id),
		onError: (error) => {
			if (isConflict(error)) refreshJobs(queryClient, id);
		},
	});
	return {
		...mutation,
		describe: (error: unknown) => getApiErrorMessage(error, undefined, { 409: config.conflict, ...config.messages }),
	};
}

interface NewJob {
	title: string;
	description: string;
	amount: string;
	/** The provider's user id; when given, the job is assigned to them right after it's created. */
	providerUserId?: string;
}

/**
 * Posts a job: `POST /jobs` `{ title, description, price_amount, price_asset }`
 * (the backend has no provider on create), then — if a provider was chosen —
 * `POST /jobs/{id}/select-provider` `{ provider_id }`. The two can fail
 * separately: the job may exist even if choosing the provider didn't work, so the
 * result says which part failed and the caller sends the person to the job.
 */
function usePostJob() {
	const queryClient = useQueryClient();

	return useMutation({
		meta: { action: "jobs.post" },
		mutationFn: async (values: NewJob) => {
			const { data } = await axiosAuth.post<ApiSuccessResponse<Job>>(apiRoutes.jobs.BASE, {
				title: values.title,
				description: values.description,
				price_amount: values.amount,
				price_asset: "USDC",
			});
			const job = data.data;
			if (!values.providerUserId) return { job, providerError: null as string | null };
			try {
				await axiosAuth.post(apiRoutes.jobs.byIdSelectProvider(job.id), { provider_id: values.providerUserId });
				return { job: { ...job, status: "PROVIDER_SELECTED" as const, provider_id: values.providerUserId }, providerError: null as string | null };
			} catch (error) {
				return { job, providerError: getApiErrorMessage(error, "We couldn't assign that provider.", { 404: "That provider couldn't be found." }) };
			}
		},
		onSuccess: ({ job }) => {
			refreshJobs(queryClient, job.id);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, undefined, { 403: "Only client accounts can post jobs." }));
		},
	});
}

export { JOBS_KEY, useDispute, useFundEscrow, useJob, useJobTransitions, useJobs, useMarkCompleted, usePostJob, useReleaseEscrow };
