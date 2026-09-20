# gwani

A marketplace platform on the Stellar blockchain connecting clients with verified service
providers, with escrow-protected payments (funds locked on Stellar Testnet before work
begins, released on completion). Scoped as a 20-day proof-of-concept sprint, not a full
production build. Full brief:
https://docs.google.com/document/d/1LDWNKfpSbAy37leogeNW0ViO0lbU97eDKdqPy-27mKU/edit

Core flows: provider onboarding (connect Stellar wallet, build a profile — service
categories, region, reputation, work history) · client discovery (browse/filter providers) ·
job posting → provider selection → escrow funding → in-progress → completion → payment
release, with reputation updating on completion.

The codebase itself was forked from [peakline](../peakline)'s monorepo structure and
`packages/ui` design system (a different product — a wallet/send-money app, not a
marketplace) purely for its component library and tooling patterns. Don't assume peakline's
domain concepts (wallets-as-accounts, transactions, payment links) map onto gwani's
domain (jobs, escrow, providers) — they don't; re-derive gwani's own data shapes from the
brief above.

## Backend

A real backend already exists and is the source of truth for every domain shape — it is
**not** built in this repo. Swagger UI: https://gwani-backend-production.up.railway.app/docs
(raw OpenAPI JSON at `/docs-json`, which is what's actually reliable — see the note on the
`data` envelope below). NestJS, Railway-hosted, auth is email/password + OTP email
verification (not wallet-based — connecting a Stellar wallet is NOT the login here, unlike
an earlier plan drafted before this backend's existence came up; a signup picks `CLIENT` or
`PROVIDER` at registration). Wallets are **custodial by default** (the platform creates and
funds one via Testnet friendbot + a stablecoin trustline, `POST /wallet/me/bootstrap`) with
an **optional** external-wallet-linking flow for providers only
(`POST /wallet/link/challenge` → sign the returned challenge string with the Stellar private
key → `POST /wallet/link/verify`). Escrow (`fund`/`release`/`refund` under
`/jobs/{id}/escrow/*`) and the job status state machine (`POSTED → PROVIDER_SELECTED →
FUNDED → IN_PROGRESS → COMPLETED → PAID`, plus `DISPUTED`/`CANCELLED`) are entirely
server-side — this app never talks to Stellar/Horizon directly, it only calls these REST
endpoints. An admin surface exists (`/admin/*`: user suspension, GDPR export/erasure,
dispute force-transition) but no admin app is planned yet.

**The browser can't call the backend directly** — confirmed live, an OPTIONS preflight
against it returns no `access-control-allow-origin` header for any origin tested. All API
calls go through this app's own same-origin proxy at `apps/web/src/app/api/proxy/[...path]/
route.ts` (mirrors peakline's identical proxy, minus peakline's `peakline-ref` API-key header
— this backend's OpenAPI spec declares only a bearer-JWT security scheme, nothing else to
attach). `GWANI_API_BASE_URL` (server-only env var, see `.env.example`) points at it.

**Every successful response is wrapped** in `{ data: ..., meta: { timestamp, request_id } }`
by a global interceptor — confirmed live against `/skills`, `/health/live`, and
`/providers/discover`, even though the OpenAPI spec's prose descriptions say "returns X" as
if unwrapped. Trust live behavior over the docs' prose; the exact field/schema descriptions
in the spec have already been caught wrong once (`providers/discover`'s paginated field is
`items`, not `data` as documented). Every typed API call should go through
`ApiSuccessResponse<T>` in `apps/web/src/lib/api/types.ts` and unwrap `.data.data`, the way
`features/auth/hooks/useSession.ts` does. Not yet directly confirmed for the auth endpoints
specifically (untestable without a real inbox for the OTP step) — verify against the network
tab on the first real signup/login call and fix `types.ts`/`axios.ts` if wrong.

An earlier version of this file (before the real backend's existence came up) planned a
from-scratch Prisma+Postgres backend built into `apps/web`, with our own SEP-10 wallet-based
auth. **That plan is superseded and was never built** — everything above replaces it.

## Monorepo layout

Turborepo + pnpm, same shape as peakline:

```
apps/
  web/        Next.js 16 app (App Router) — the signed-in product (auth, both
              dashboards). The only app with code so far.
  landing/    the public marketing site — folder exists, NOT scaffolded yet
              (no package.json). Don't put a landing page in apps/web.
  admin/      the staff app — folder exists, NOT scaffolded yet.
packages/
  ui/                 shared design system (@repo/ui) — components, tokens
  eslint-config/
  typescript-config/
```

## What differs from peakline

- **Font**: Manrope (`--font-manrope`), not DM Sans — loaded in `apps/web/src/app/layout.tsx`
  via `next/font/google`, same pattern as peakline.
- **Primary color**: the indigo/violet ramp supplied by design (`primary-100`…`primary-900`
  in `packages/ui/src/styles/globals.css`), not peakline's forest emerald.
- **Neutral**: the supplied black/white ramp (`#FFFFFF`→`#000000`, 1–9 → `neutral-100`…`900`).
  Note `neutral-100` is pure white, so "subtle light surface" uses (skeleton, disabled
  inputs, empty-state icon) go through the `--muted` token (`#f5f5f5`) instead — don't reach
  for `bg-neutral-100` expecting a tint. `--foreground` is `neutral-800` (`#111111`).
- **Secondary**: still a **placeholder** standard gray scale — no secondary brand color has
  been specified. Replace the `--secondary-*` values in `globals.css` once one exists; no
  component code needs to change, they only reference the token names.
- **Brand assets**: real ones now live in `packages/ui/src/assets/` — `logos/`
  (`primary-logo.svg` used by `Logo`; `favicon.svg`), `favicon/` (PNG/ICO set + manifest;
  copies served from `apps/web/public/favicon`, and `favicon.ico` also at
  `apps/web/src/app/favicon.ico`), `images/` (auth panel background + hero). Peakline's own
  brand imagery was never copied. The favicon set comes from a generator — if regenerated,
  re-copy into `apps/web/public/favicon` and re-fix the manifest (`name`, `/favicon/` icon
  paths, `theme_color: #3231C6`).
- **Metadata**: site name/tagline/description live in `apps/web/src/lib/site.ts` (shared by
  `layout.tsx` and the OG image). Tagline/description are placeholder wording derived from
  the brief, not supplied copy — change freely. Titles use a `%s | Gwani` template, so pages
  set only their own name. OG/Twitter images render from `app/og-image.tsx` with Manrope
  `.woff` files in `app/og-fonts/` (Satori needs literal font files, not `next/font`).
- **`badge.tsx`**: peakline's version baked in a 5-state `PaymentStatus`/`StatusBadge` pair
  specific to its payment product. Stripped down here to a generic `Badge` with
  `default`/`secondary`/`outline`/`success`/`warning`/`info`/`destructive` variants. Add a
  domain-specific status badge back once there's a real status enum to model.
- **`phone-input.tsx`**: default country changed from peakline's hardcoded `"GH"` (its
  actual target market) to `"US"` as a neutral placeholder. Change `DEFAULT_COUNTRY` once
  the target market is known.
- **Auth / backend wiring**: peakline's `lib/config/axios.ts` pattern (bearer token
  injection, 401 refresh-and-retry, cross-tab refresh lock via `authStore`+cookies) **was**
  ported, adapted to the real gwani backend's actual field names (snake_case:
  `access_token`/`refresh_token`, not camelCase) and response envelope (see "Backend"
  above) — see `apps/web/src/lib/config/axios.ts`, `lib/stores/authStore.ts`. Simpler than
  peakline's version in one way: no `customerType`-drift/caching dance, since gwani's
  `role` (`CLIENT`/`PROVIDER`/`ADMIN`) is fixed at signup and rides along on every
  login/signup/verify-otp response directly.
- **Illustrations / feature UI**: none of peakline's actual screens (auth forms, dashboard,
  wallet, etc.) were ported — only the reusable `packages/ui` primitives, the app shell
  (`layout.tsx`, `error.tsx`, `not-found.tsx`, `loading.tsx`, a placeholder `page.tsx`), and
  the API integration layer (`lib/api/types.ts`, `lib/config/apiRoutes.ts`, `lib/config/
  axios.ts`, `lib/stores/authStore.ts`, `components/providers/AuthProvider.tsx`,
  `app/api/proxy/`, `features/auth/hooks/useSession.ts`). Real auth forms (sign up/login/
  OTP), job posting/discovery UI, etc. get built next, incrementally, from provided designs.

## What's identical to peakline

Everything else: the full `packages/ui` component set (button, dialog, drawer, form,
input variants, otp/phone/password/date-of-birth inputs, select, stepper, sonner toaster
wired through `Alert`, status-page, empty-state, skeleton, etc.), the type scale, radius
scale, `cn()`'s `extendTailwindMerge` setup (**must** stay extended — see peakline's
CLAUDE.md "Landmines" for why: tailwind-merge misclassifies the custom `text-*` size
tokens as colors otherwise), Tailwind v4 + `@theme inline` token wiring, ESLint/TypeScript
shared configs, and the `apps/web` app-level stack (react-hook-form + zod +
`@hookform/resolvers`, TanStack Query, zustand, axios, js-cookie, lucide-react).

## Landmines (inherited from peakline — still apply here)

1. **`cn()` must stay `extendTailwindMerge`d** (`packages/ui/src/lib/utils.ts`) — don't
   replace with a plain `twMerge`.
2. **pnpm strict linking**: any package a file imports directly (bare specifier) must be a
   dependency of *that file's own* package (`lucide-react` is a dep of both `@repo/ui` and
   `apps/web` for this reason; `next/*` imports stay out of `packages/ui` entirely).
3. **Restart the dev server after `pnpm install`** — Turbopack resolves `node_modules` at
   startup.
4. **Toasts render the actual `Alert` component** via `toast.custom()` — don't re-implement
   the visual separately.
5. **Every `<form>` using `form.handleSubmit(...)` needs `noValidate`** or native HTML5
   constraint validation silently blocks the submit before react-hook-form/zod ever run.

## Auth screens

- `app/auth/layout.tsx` wraps every auth route in `components/layouts/AuthLayout.tsx`: single
  column below `lg`, sticky brand panel + form column from `lg` up. Screens just render into
  it. Built so far: `/auth/sign-up` (role selection) and `/auth/sign-up/details?role=client|
  provider` (the form; a missing/unknown role redirects back to role selection). Sign-up
  posts `POST /auth/signup` (`useSignUp`), stores the email in `signUpFlowStore`
  (sessionStorage) and pushes to `/auth/verify-otp`. `/auth/sign-in` is built (below).
  The Terms/Privacy text in the form is styled like links but isn't linked (no such pages yet).
- **The whole auth flow runs on mock data for now — the user wants no backend calls until the
  UI is finished.** `MOCK_AUTH` in `lib/simulation.ts` (currently `true`) makes `useSignUp`
  simulate instead of hitting `POST /auth/signup` (the real call stays in place behind the
  flag; `taken@example.com` fails with a 409 to exercise the error state). Verify/resend have
  no real implementation yet. Apply the same mock-first approach to every new auth screen
  (sign-in, forgot/reset password, ...) — don't wire a screen to the real API unprompted; the
  real signup call was live for a while and returned an internal error from the backend.
- `/auth/verified?role=client|provider` is the success screen after OTP (anything but
  `client` shows the provider version). Provider CTA → `/provider/onboarding`, client CTA
  ("Find a provider") → `/client/dashboard/providers` (not built yet);
  `/provider/onboarding` exists. `signUpFlowStore` also carries the role chosen at sign-up.
- **Client vs provider sign-up differ:** the client form (`role=client`) also asks for country +
  state (shared `components/forms/LocationFields.tsx`, mock data in `lib/mock/locations.ts`) and its
  footer reads "Looking for work? Join as a provider"; the provider form has neither (location is
  collected in provider registration). The backend signup doesn't take a location, so the client's
  country/state are collected but unused until there's somewhere to send them.
- **`/auth/sign-in` is mock-only** (`useSignIn`): any valid email/password succeeds and routes to
  the role's dashboard (see "App routing"); `wrong@example.com` fails with a 401, and an address
  starting with `client` signs in as a client (anything else: provider). "Forgot Password?" links to
  `/auth/forgot-password` (not built). The real call and `remember me` handling notes are in the
  hook. The sign-in mock has no "Sign up" link, so none was added.
- Desktop content is anchored ~240px from the top (`AuthLayout`, matching every mock and the
  panel headline), not vertically centered; the offset shrinks on short windows so content
  isn't pushed off-screen. Tablet (`md`) stays centered, mobile is top-aligned.
- **`/provider/onboarding` (provider registration) is mock-only too.** It uses its own shell
  (`components/layouts/OnboardingLayout.tsx` — hero + benefits card on the left, no blue panel)
  under `app/provider/(setup)/layout.tsx`. `useProviderRegistration` simulates the save and then
  routes to `/provider/wallet`. Gaps to close before going live: the real call
  is `PATCH /providers/me/profile` `{ bio, location_country, location_city, skill_slugs }` but
  `skill_slugs` must come from the `GET /skills` catalog, so the free-text skills `TagInput`
  needs to become a catalog autocomplete; the backend has no "category" (the categories in
  `lib/mock/providerOptions.ts` are a grouping of its real skill names) and no separate
  state/area (only country + city + geohash). States are mocked for NG/GH/KE/ZA only — other
  countries get a free-text field. The benefit-card icons are meaningful ones (search/star/shield);
  the mock used the same person glyph three times.
- **Provider setup screens share `OnboardingLayout`** via the `app/provider/(setup)` route group
  (`onboarding` → `wallet`). From `lg` up the viewport is fixed: logo + hero + benefits stay put
  and the right column has a fixed height. Screens that put a `shrink-0` heading first and a
  `min-h-0 flex-1 overflow-y-auto` region second (provider registration) keep the heading fixed
  and scroll only the form; otherwise the column itself scrolls. Scrollbars are always hidden
  (`.hide-scroll`); the hero shrinks on short windows. Below `lg` the page scrolls normally and
  the left side is hidden.
- **`TagInput` (`@repo/ui`) is an email-recipients-style field**: pills live *inside* the field,
  a suggestions dropdown opens on focus (filtered as you type, arrows + Enter or click to pick),
  and Enter/comma/blur commits typed text as a custom pill. In the registration form the
  suggestions follow the chosen category (real skill names from the backend's catalog, grouped in
  `lib/mock/providerOptions.ts`). Note `FormControl` overwrites `data-slot` on the inner input —
  select it by `role="combobox"` in tests.
- **`/provider/wallet` is mock-only** (`useWallet`): "Connect" accepts any well-formed Stellar
  public key (`G` + 55 base32 chars) and "Generate a wallet" just succeeds; both then go to `/`
  (next screen not designed). The real flows: linking is a *signed challenge* —
  `POST /wallet/link/challenge` then `POST /wallet/link/verify` with a signature, so a pasted
  public key alone can't be verified — and "generate" maps to the platform custodial wallet,
  `POST /wallet/me/bootstrap`.
- **Wallet flow (all simulated):** `/provider/wallet` (connect/generate) → `/provider/wallet/connecting`
  (spinner, ~2.6s, `WalletConnecting`) → `/provider/wallet/connected` (`WalletConnected`: masked address,
  copy, "Go to Dashboard" → `/provider/dashboard`, not built) or `/provider/wallet/failed` (plain
  full-page `WalletFailed`, outside the `(setup)` layout). The key travels in `walletFlowStore`; a
  pasted key ending in `ZZZZZ` fails, so the failure screen is reachable. Opening `/connected` or
  `/connecting` directly previews the design (sample address). The connecting screen is where the
  real link-challenge/verify or bootstrap calls belong. `useStoreHydrated` (`src/hooks`) is the
  pattern for `skipHydration` stores. The support link on the failed screen uses a placeholder
  address, `SUPPORT_EMAIL` in `lib/site.ts`.
- If a freshly added route 404s in `next dev` while `next build` lists it, the dev cache is stale —
  restart the server (deleting `apps/web/.next/dev` if needed).
- **Not-found, error and loading are branded, not generic.** `components/StatusScreen.tsx`
  renders the auth hero's "Verified Provider" card gone wrong (404 = unverified, 0.0 stars,
  0 completed jobs; error = warning badge + escrow reassurance). `app/loading.tsx` uses
  `GwaniLoader` from `@repo/ui` (twinkling four-point star with two orbiting nodes, pure
  CSS/SVG, respects reduced motion). The error page's escrow line ("payments held in escrow
  stay protected until you approve a release") is my copy — confirm it's an accurate promise.
  There's no `global-error.tsx` yet (errors thrown in the root layout itself aren't covered).
- **`/auth/verify-otp` is SIMULATED, not wired to the backend** (deliberately, per the user).
  `useVerifyOtp`/`useResendOtp` in `features/auth/hooks/useVerifyOtp.ts` use
  `simulateRequest` (`lib/simulation.ts`): any 6 digits succeed (clears the flow store and routes
  to `/auth/verified?role=…`); `000000` fails with an
  `AxiosError`-shaped 400 (`simulatedApiError`, so the message/4xx-warning handling is
  identical to a real failure). To go live, swap each `mutationFn` for the real call —
  `POST /auth/verify-otp` `{ email, otp }` (returns tokens → `useAuthStore.setTokens`, then route
  by `user.role`) and `POST /auth/resend-otp` `{ email }` — and nothing else changes. The resend
  countdown is a fixed 45s (`RESEND_SECONDS`); the backend doesn't return a TTL.
- `AuthBackButton` (`features/auth/components`) only renders on routes listed in
  `ROUTES_WITH_BACK` (currently just verify-otp): in the brand panel on desktop, in the header
  on mobile. `signUpFlowStore` uses `skipHydration` (the OTP form rehydrates it in an effect) so
  the first client render matches the server's.
- The envelope on the OTP screen is a hand-drawn SVG (`EmailVerificationIllustration`) standing
  in for an asset that wasn't in the images folder. The OTP mock's hero image also shows a
  rounded-square crop where the other screens show the oval — the shipped `auth-image.svg` is
  oval-masked, so all screens use it as-is.
- Heading sizes are per-mock (measured, not a single scale): role select 40px, Sign Up 48px,
  Email Verification 36px on desktop (20px on mobile).
- Responsive verification: headless Chrome won't go narrower than ~500px with `--window-size`.
  Either load the page in a narrow `<iframe>`, or (better, and needed for interaction) drive
  Chrome over the DevTools protocol — `Emulation.setDeviceMetricsOverride` gives true mobile
  emulation, and `Fetch.enable` lets you mock `/api/proxy/...` responses so tests never hit
  (or create accounts on) the real backend.
- `Input`/`Textarea` placeholders are `neutral-300` (light, per the design) and `Input` has a
  transparent fill so it picks up the page tint. Failed 4xx API calls log as `console.warn`
  (not `error`) in `ReactQueryProvider`, so expected failures don't trip Next's dev "Issue" badge.
- Design copy differences I normalized (confirm they're intended): the mock says "Gwanni" in
  places — brand is "Gwani" per the logo; "stellar" → "Stellar"; desktop subtitle "Which
  describes you best?" → the mobile mock's "Which best describes you?".

## Provider dashboard

- Lives under `app/provider/dashboard/*` (layout → `features/dashboard/components/DashboardShell`).
  Built so far: the shell, the overview (`/provider/dashboard`), the profile
  (`/provider/dashboard/profile`) My Jobs (`/provider/dashboard/jobs`) and a job's detail
  (`/provider/dashboard/jobs/[id]`). the wallet (`/provider/dashboard/wallet`). The menu also links to `/settings`,
  `/help` under it — neither exists yet (they hit the branded 404). Note `/provider/wallet` (no `dashboard`) is the *setup*
  connect-wallet screen, a different thing from the dashboard's Wallet page.
- **Keep the mock's floating-card look** (logo on the page beside a header card with search/bell/
  user, a menu card, a bordered page card) — the user was explicit that only the *positioning*
  should change, not the design (an attempt at flush peakline-style bars was rejected). `lg`+: the
  header row (a solid strip so scrolled content hides behind it) and the menu card are `fixed`; the
  menu card runs down to 20px above the bottom of the screen. `fixed`, not `sticky`, and the content
  column reserves their space with `lg:pt-36.5` (146px = 20 + 98 header card + 28 gap) and
  `lg:pl-67` (268px = 20 + 228 menu + 20 gap) — keep those in sync with the sizes in
  `DashboardShell`. Below `lg`: a fixed logo + hamburger header; the menu
  is a left slide-in (`MobileNav`, a Radix dialog restyled as a side panel, 300ms ease-out in /
  200ms ease-in out, backdrop timed to match via `DialogContent`'s `overlayClassName`), the page sits
  straight on the tinted background, and the page itself shows the bell + avatar (a page built for
  this shell must render them under `lg:hidden`, as `DashboardOverview` does). Search and the bell
  are static — nothing behind them yet. Job card type is deliberately small (16/14/12px on phones,
  18/16/14px from `md`).
- **Type scale (dashboards and settings; the user found the mocks' sizes too big).** Content sizes were
  scaled down for desktop and made to step up with the viewport, mobile untouched, layout untouched: page
  titles `text-xl` → `lg:text-h4` (28px) → `2xl:text-h3` (32px) (was 40px); stat and balance values
  `lg:text-h4 2xl:text-h3`; buttons, links, tabs, card labels and list rows `lg:text-b1` (16px, was the
  18px `text-s1`); section headings stay `text-xl` (`lg:text-lg` inside the wallet); dialog titles `sm:text-xl`
  (was 24px), the completion success heading `sm:text-h4`; profile name `lg:text-h5`; form fields on the
  post-job form and in Settings 48px → 52px → 56px at `lg`/`xl`/`2xl`. Use these as the defaults for new
  dashboard screens rather than copying the mock's pixel sizes. **Auth and provider-onboarding screens were
  not touched** (they still use the mock's larger sizes).
 — both write
  `.next/dev/types` and the build's type-check then fails on a half-written file.
- **Mock data only** (`lib/mock/providerDashboard.ts`): the stats, 12 jobs, and the "John Doe"
  user. Job rows are a view model — the backend's `Job` has no client name, location or job date, so
  those need joins/extra endpoints before this can go live. The greeting follows local time
  (`useGreeting`, neutral on the server to avoid hydration mismatch). "N active jobs" is computed
  from the mock list (the mock said 3 while showing 4 cards). The pager (`Pagination`, `@repo/ui`)
  is shown only below `lg`, as in the mocks; desktop relies on "View all".
- `JobStatusBadge` (`@repo/ui`) fixes the status → label/colour mapping used everywhere: FUNDED
  "Payment Secured" (green), PROVIDER_SELECTED "Provider Selected" and IN_PROGRESS "In Progress"
  (orange), plus my choices for the rest (POSTED "Open", COMPLETED/PAID green, DISPUTED, CANCELLED).
- **Profile** (`features/dashboard/components/profile/`, mock: `lib/mock/providerProfile.ts`): built from
  the mock's first desktop variant (reputation card beside the avatar, About + Skills side by side,
  full-width wallet card, bordered work-history list) and the mobile mock without its bottom nav. On
  phones each history row becomes a label/value card and the pager appears (`lg:hidden`, as on the
  overview); the "Profile" h1 is `sr-only` there. The wallet card is the shared
  `components/WalletAddressCard` (also used on the wallet-connected screen). Choices to confirm: the
  mocks disagree on the name (used the logged-in mock user, John Doe), had typos ("UDSC" → USDC) and
  placeholder bio text (replaced); the headline "Plumber" and the 4.8 / 22 / 20 / 27 figures come from
  the design and aren't derived from each other; the menu says "My Jobs" though the profile mocks say
  "Jobs". Backend gaps: no headline field, and avatars need the file-upload flow. `StarRating`
  (`@repo/ui`) is display-only and rounds to whole stars. COMPLETED is now green like PAID (the
  work-history mock shows a green "Completed").
- **My Jobs** (`features/dashboard/components/jobs/JobsView`, mock: `lib/mock/providerJobs.ts`, 50 jobs):
  status tabs (an accessible tablist with arrow-key navigation) over the same `JobCard`s as the overview,
  10 per page. Unlike the overview the pager shows at every size (this is the full list; the desktop mock
  was cut off before it). Tab → status mapping is in `JOB_FILTERS`: In Progress = PROVIDER_SELECTED/
  FUNDED/IN_PROGRESS, Completed = COMPLETED/PAID, and **On Hold = DISPUTED** — the backend has no "on
  hold" status, so confirm that's the intent. "All" also includes open and cancelled jobs. The "My Jobs"
  h1 is `sr-only` on phones (the mock starts at the tabs); the mobile mock's bottom nav is not built (the
  slide-in menu is the mobile nav). Meta-row icons stay person/calendar/pin as on the overview (the
  jobs mock used a pin for all three). Empty tabs show an `EmptyState`.
- **Job detail** (`features/dashboard/components/jobs/{JobDetailView,JobTimeline,CompleteJobDialog}`, mock:
  `lib/mock/providerJobDetail.ts`, looked up by the list's job id, unknown id → 404): only the desktop
  mock was supplied, so tablet/mobile are my adaptation (timeline turns vertical below `md`, the two
  columns stack). A round back button beside the logo (`HeaderBackButton`, driven by a route table in
  that file, so future detail pages just add a row). The six-step timeline (Posted → Provider Selected
  → Payment Secured → In Progress → Completed → Paid) marks steps reached up to the job's status; a
  DISPUTED job shows through In Progress, CANCELLED only Posted. The mock printed a date under every step,
  including unreached ones — here only reached steps carry one (dates are derived from the job date, the
  backend has no per-step timestamps). Dates use the app's day-first style ("14 Aug"), not the mock's
  "Apr 12". "Mark as Completed" (IN_PROGRESS only) opens the confirm dialog → simulated request → success
  step; the page behind flips to Completed but nothing persists, so a reload restores the mock status.
  The real call is `POST /jobs/{id}/mark-completed`. Copy I wrote or corrected: the payment-box text for every
  status other than in-progress/funded, "The client has been notified to review your work." (the mock's
  success text was pasted from the wallet screen), and the mock's typos ("clients", "weeb deesigner").
  The mock's menu shows a duplicate "Settings" — ignored. No "Start job" action for FUNDED jobs yet (not
  designed; the backend has that transition).
  **Reject Job** (`RejectJobDialog`): an outline-red button under "Mark as Completed" while the job is
  PROVIDER_SELECTED / FUNDED / IN_PROGRESS (the provider has it, hasn't finished it). Dialog = the completion
  dialog's frame (`JobDialog` + `JobSummary` in `jobs/JobDialogParts`, shared) plus a required reason (10–500
  characters). The mock has no success step, so submitting closes it, toasts, and the page shows the job as
  Cancelled. The mock's subtitle ("mark it as completed") was pasted from the other dialog — reworded to "Let
  the client know you can't take this job." **The backend has no provider-reject endpoint** (providers can
  only `mark-completed`; `dispute` works only on COMPLETED jobs) — it needs e.g. `POST /jobs/{id}/reject
  { reason }` and, if escrow is already funded, a refund to the client (`POST /jobs/{id}/escrow/refund`),
  ending in CANCELLED.
- **Wallet** (`features/dashboard/components/wallet/{WalletView,BalanceCard,RecentTransactions}`, mock:
  `lib/mock/providerWallet.ts`): blue balance banner with the two summary tiles tucked under it (an
  opaque `#f4f4ff` panel, since it overlaps the blue), the shared `WalletAddressCard`, recent
  transactions. The eye hides only the balance. **Withdraw has no design** — it toasts "Withdrawals aren't
  available yet". `View all` → `/wallet/transactions` (not built, 404s). Choices to confirm: the mock
  showed the same tile twice, so I made them "Pending Earnings" and "Total Earned" (48,500 is invented),
  with meaningful icons (clock / trend) instead of the mock's repeated person glyph; the mock's
  transactions read like a client's wallet ("Payment to…", "Wallet Funded"), so I rewrote them for a
  provider (received payments, a withdrawal, funding) keeping its colours (green in, red out) and arrow
  directions; dates are absolute UTC ("20 Aug, 2026, 10:26 AM") rather than the mock's "Today/Yesterday"
  (relative labels would mismatch between server and browser render); status is a pill on desktop and
  plain grey text on phones, as in the mocks; "View all" is the wallet-connected screen's emerald.
  The "Wallet" h1 is `sr-only` on phones. Real data would come from the backend's wallet balance and
  transactions endpoints (not checked against the spec yet).
- No auth guard yet (mock sign-in doesn't issue tokens). "Logout" just clears the auth store and
  goes to `/auth/sign-in`. Avatars are initials — the mock's desktop avatar image wasn't supplied.

## App routing

- **Role-prefixed trees, not a shared URL:** `/provider/dashboard/*` and `/client/dashboard/*`
  (recommendation agreed with the user). A role is fixed at signup, the two dashboards' pages differ a
  lot, and a role in the URL means no wrong-dashboard flash and a simple per-prefix guard. Both use one
  frame (`DashboardShell role=…`, `features/dashboard/config.ts`).
- **`/` in apps/web is a router, not a page** (`features/auth/components/RoleRedirect`): signed in →
  `dashboardHomeFor(role)`, otherwise → `/auth/sign-in`. The public site is `apps/landing`. ADMIN has no
  dashboard here (its own app), so it falls back to sign-in.
- **The role comes from `lib/stores/mockSessionStore`** (localStorage, role only) because mock sign-in
  and OTP issue no tokens. Mock sign-in sets it from the email (`client…` → client), OTP verify from the
  role chosen at sign-up, dashboard Logout clears it. **When auth goes live, delete the store and read
  `user.role` from the login/verify response or `useSession`** (call sites are commented).
- **No route guards yet, deliberately** — the dashboards are open so screens can be previewed by URL.
  Add them with real auth: a role check per tree (provider on `/client/*` → redirected to their own
  dashboard) needs the role on the server (JWT claim or a small cookie) to avoid a client-side flash.
- `robots.ts` blocks crawlers from `/api/`, `/client/` and `/provider/` (landing is what gets indexed).
- Open questions: if landing lives on another (sub)domain, links from it to `/auth/*` should use an env
  var for web's origin, and a parent-domain session cookie is only needed if landing wants to show
  "Go to dashboard" to signed-in visitors. Provider discovery is currently *inside* the client dashboard
  (behind login); a public `/providers` would belong on landing or as a public web route.

## Client dashboard

- Lives under `app/client/dashboard/*`, in the **same frame as the provider's** — `DashboardShell`
  takes a `role` ("provider" | "client") and the menus/home links come from
  `features/dashboard/config.ts` (`DASHBOARD_CONFIG`). New role-specific screens: add the page and,
  if it's in the menu, it's already linked (menu items with no page 404). Client menu: Overview, Find
  Providers, Jobs, Profile, Wallet · Settings, Help. Built so far: the overview
  (`/client/dashboard`), Find Providers (`/client/dashboard/providers`), a provider's preview (`.../providers/[id]`), My Jobs
  (`.../jobs`), Post a New Job (`.../jobs/new`) and Settings. Not built: the client's Wallet, Profile and
  Help, and a job's detail (`.../jobs/[id]`, so the job cards' "View" 404s). Everything in the "Provider
  dashboard" notes about the frame (fixed floating cards, spacing constants, mobile drawer, bell/avatar
  under `lg:hidden`) applies here too.
- **Overview** (`features/dashboard/components/client/{ClientOverview,ClientJobCard,QuickActions}`, mock:
  `lib/mock/clientDashboard.ts`): greeting, three stats (Active Jobs, Completed Jobs, Total Spent),
  Quick Actions (Post a New Job → `/client/dashboard/jobs/new`, Find Providers, Wallet — none built),
  and the active jobs. The stat row is 3-up from `xl`; the Total Spent value drops a size below `2xl`
  so "25,000 USDC" fits (`StatCard`'s `valueClassName`). The signed-in name is still the one mock user
  ("John Doe", from `MOCK_PROVIDER`) — there's no separate client user mock yet.
- Copy/data choices to confirm: the mocks disagree on the active count (25 / 3 / four cards shown), so
  it's computed from the mock jobs (4) and the subtitle says "your jobs" (desktop) — the mobile mock's
  wording was used for both; Quick Action icons are meaningful ones (briefcase/person/wallet) rather
  than the mobile mock's link/QR glyphs; only *active* jobs are listed here, "View all" is the full list;
  the mock's first card is highlighted (a hover state) — reproduced as hover only. The provider's name
  and category name on a job card are joins the backend's `Job` doesn't give directly.

- **Find Providers** (`features/dashboard/components/client/providers/{FindProvidersView,ProviderCard,FilterPill}`,
  mock: `lib/mock/providers.ts`, 128 generated providers): a search box (live filter on name, trade and
  location), category / location / rating chips, a 3-up card grid (2 on tablet, 1 on phones), 6 per page
  with the pager at every size. The chips are **native `<select>`s** laid invisibly over a styled pill
  (`FilterPill`) — the platform picker on phones, accessible for free; "All Categories" keeps its
  highlighted look even when unset, as in the mock. The results count is visible on phones only (the
  mock's desktop omits it) and `aria-live` everywhere. Search button is desktop-only (mobile mock has
  none; the list filters as you type anyway). **The trailing "Filter" chip has no design** — it toasts
  "More filters are coming soon". Avatars are initials (the mock's photo isn't an asset). "View profile"
  → `/client/dashboard/providers/{id}` (not built). The mocks repeat one placeholder provider ("Jane
  Doe, Plumber, 4.0, 22 jobs"), so names/trades/figures are varied to make filters testable. Real data:
  `GET /providers/discover` (`items`) — its filter params and the missing category/trade title still
  need checking against the spec.
- **Provider preview** (`.../providers/[id]`, `ProviderPreviewView`, mock: `lib/mock/providerPreview.ts`):
  what a client sees before hiring. Built from the same shared parts as the provider's own Profile
  (`features/dashboard/components/profile/ProfileParts`: identity, reputation, About, Skills — plus the
  wallet card and `WorkHistory`), so the two can't drift; `ProfileView` was refactored onto them. Mobile
  order differs from desktop (reputation first on phones; About + Skills above reputation + wallet on
  desktop — DOM follows phone order, `lg:order-*` rearranges). "Back to providers" is an in-page
  `BackHeader` link (a fixed parent, not `router.back()`, so it doesn't restore filters/page). "Hire
  Provider" → `/client/dashboard/jobs/new?provider={id}`. Choices to confirm: the mobile mock drew work
  history as job cards but the provider's own profile mock drew label/value cards — I reused the latter
  everywhere; the mock showed 22 / 22 / 20 for related counts, here one figure (`jobs_completed`) feeds
  all three; "View all" has no target yet (points back at this page); the wallet address is the sample key.
- **My Jobs (client)** (`ClientJobsView`, mock: `MOCK_ALL_CLIENT_JOBS`, 50 jobs): the provider's jobs list and
  this one share `jobs/JobsBoard` (tabs, pager, empty state) and differ only in the card and the header
  action ("Post a New Job" opposite the title). Tab mapping is `JOB_FILTERS` (On Hold = DISPUTED). The
  mock's highlighted "Find Providers" menu item on this screen was a mock slip — "Jobs" is highlighted.
- **Post a New Job** (`PostJobForm`, validation `lib/validations/jobValidations.ts`): Service Provider
  (native select over the 128 mock providers; preselected from `?provider=`, unknown ids ignored), Title,
  Description, Amount + a fixed USDC box. **Backend shape:** `POST /jobs` takes only title (3–200),
  description (10–5000) and `price_amount` (decimal string, ≤7 places) + asset — the provider is chosen
  in a *second* call, `POST /jobs/{id}/select-provider` — so this form's first field is really step two.
  **"Next" leads to a screen that isn't designed** (presumably review + fund escrow): a valid form just
  toasts that; nothing is created.
- **Settings / Account** (`features/settings/`, routes `/provider/dashboard/settings` and
  `/client/dashboard/settings`, one `SettingsView role=…`; from the supplied mocks). **Two looks, same
  forms:** below `lg` an "Account" page (avatar with camera badge, the shared wallet card, a menu list:
  Personal Information · Provider Information (providers only) · Help & Support → Contact Support (a
  `mailto:`) · Change Password / Logout / Delete Account in red) where every item opens a **sheet**; from
  `lg` a sub-nav (Personal Information, Provider Information, Account Settings, Change Password, Delete
  Account) with an **inline panel** for the first four — **Change Password is a normal page on desktop and a
  drawer on mobile** (the user's call) — and only Delete Account opens as a modal. A sheet is the UI kit's `ResponsiveDialog` (`SettingsSheet`): a **vaul drawer below 640px, a modal
  from there up** (so tablets get modals, as the user asked: "modals on desktop, drawers on mobile"). Forms
  take `layout="panel" | "sheet"` (`formParts.tsx`: inline panels are 16px labels / 48px fields from `lg`, 52px
  fields from `xl`, 18px labels / 56px fields only from `2xl`; sheets are 16px / 44px rounded; blue-outline vs
  grey-outline Cancel). Panel Cancel restores the saved values; sheet Cancel
  closes. Content unmounts on close, so each open starts from the saved values.
  - Personal Information: first/last name editable, **email read-only** with a "contact support" note —
    `PATCH /users/me` takes only the names and there's no email-change flow. Avatar: pick an image (PNG/
    JPG/WebP ≤5 MB) to preview it locally; not uploaded (real: `POST /files/request-upload`, purpose
    `AVATAR`); initials until then (the mock's 3D avatar isn't an asset).
  - Provider Information: the registration form's fields prefilled (`MOCK_PROVIDER_INFO`), same schema and
    the same backend gaps (skills must be catalog `skill_slugs`; no category/state/area fields).
  - Change Password: **Old + New only, as designed (no confirm field)**. **The backend has no signed-in
    change-password endpoint** (only the OTP `forgot-password` → `reset-password`) — needs a new endpoint or
    to route through the OTP flow. Test hook: old password `Wrong123` fails.
  - **Account Settings** (desktop sub-nav item; its content wasn't in the mocks): I put the email-
    notification switches there (role-specific; localStorage via `notificationPrefsStore` — the backend has
    no preferences endpoint). Confirm that's what it's for.
  - **Delete Account** (no mock; follows the other sheets): a *request* — type DELETE, then "Request
    deletion" — because the backend only has admin-side GDPR erasure. Logout uses the shared `useLogout`.
  - Not in the mocks, so not built: any settings for the client's own profile beyond the above (the mock's
    Provider Information item is providers-only; nothing client-specific was shown).
- **Screens requested but not built (no design received):** the client's Wallet page and a "success
  payments" modal (those messages arrived without their images). Ask again if still wanted.

## Known issues

- `packages/ui/src/assets/logos/*.svg` (~440KB each) and `images/auth-image.svg` (~1.8MB) are
  Figma exports — vector wrappers around embedded base64 PNGs, so they're heavy. The auth hero
  only loads at `lg`+ and the logo is on every page; export true vector / compressed WebP
  before shipping.

## Conventions (once real features start)

- Feature-based structure inside apps: `src/features/<domain>/components/`, page files in
  `src/app/**` stay thin.
- Shared visual shells go in `src/components/layouts/`.
- Reuse `StatusPage`/`LoadingBar` from `@repo/ui` for full-page states (already wired into
  `error.tsx`/`not-found.tsx`/`loading.tsx`).
