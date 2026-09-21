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

## Backend integration status — everything is connected

On 2026-09-20 the user lifted "mock-first" and asked to connect the backend; then said to do **all of it at
once, not step by step**. **No screen runs on mock data any more** (`lib/mock/` keeps only `locations` and
`providerOptions`, which are UI helpers: country/state lists and the category grouping). What each area
does and where the backend falls short is under its own section; the short version:

- **Auth, identity, guards, Settings name/profile** — real (see "Auth screens", "App routing").
- **Provider onboarding, wallet (custodial + Freighter link), Settings → Provider Information** — real.
- **Provider dashboard:** overview, jobs, job detail (+ Mark as Completed, dispute), profile, wallet — real.
- **Client:** overview, Find Providers (`/providers/discover`), provider profile (`/providers/{id}`), My Jobs, Post a
  New Job (`POST /jobs` → `select-provider`), job detail (Fund escrow, Release payment, dispute), wallet — real.
- **Avatar upload** (`/files/request-upload` → PUT to storage) — coded, but **the live backend has no such route**
  (`POST /api/v1/files/request-upload` → 404 although the spec documents it), so an upload shows "Profile photos aren't
  available on the server yet". It works unchanged once the route exists (the photo is then remembered per browser only).
- **No backend endpoint, so not real (and hidden or honest about it):** a provider *rejecting* a job (the dialog was
  removed; needs e.g. `POST /jobs/{id}/reject`), changing a password while signed in, notification preferences
  (localStorage), self-service account deletion (a request button), withdrawals, wallet **balance** and
  **transaction history** (the tiles and the list on the Wallet page are derived from the jobs list and labelled as
  such; the *balance* itself is real — `GET /wallet/me` now returns `usdc_balance`),
  notifications (the bell shows no badge), the client's name/location and a job's category/location (jobs have
  none — the mocks' fields are gone), a provider's trade title (first skill is used), provider/client
  *names on jobs*, and public work history.
- **Real provider shapes (confirmed live; the OpenAPI prose is wrong about them).** `GET /providers/{userId}` (public,
  and presumably `/providers/me/profile`): `{ user: {id, first_name, last_name, …}, provider: {user_id, bio,
  skill_category, location_country/state/city/area, reputation_score: "0.00", completed_jobs_count}, wallet_address,
  wallet_type, skills: [{id,slug,name}], skill_category, reputation_score, completed_jobs, location: {…} }`. The
  directory row (`/providers/discover`) is the flat `provider` object only — **no id (use `user_id`), no name, no
  skills**. `normalizeProvider` (`lib/providers.ts`) turns either into the app's `ProviderProfile`; the hooks
  normalize and screens never read raw shapes. Because rows have no names, `useProviderSearch`/`useProviderOptions`
  fill each *visible* row (≤6, or 20 for the job form's picker) from `GET /providers/{id}` in parallel. The backend
  can't search names, so the text box searches skill + city only. `select-provider` takes the provider's **user id**.
  The backend also has `skill_category`, `location_state`, `location_area`, although the documented PATCH only takes
  `bio, location_country, location_city, skill_slugs` — "Area, State" is still packed into `location_city`
  (`lib/providerProfile.ts`), and reads prefer the real state/area fields when set.
- **SECURITY (the backend's to fix, reported to the user):** the public `GET /providers/{id}` returns the whole `user`
  row — email and `password_hash` included. The app keeps only the fields it needs and never renders the rest; don't
  log or store that payload.
- **Still unobserved:** cursor `GET /jobs` with real jobs (the empty list is `{items: [], next_cursor: null}`). The
  `[api:…]` console log prints every raw response — check it on first real use.
- **Verified how:** every flow was run in Chrome against faithful mocked responses (network interception) plus the
  live public endpoints (`/skills`, wrong-credentials login). What has *not* been done is a real end-to-end run
  with a real inbox/account/Freighter — the user needs to do that.

**Every user action is logged to the browser console in dev** (`lib/logger.ts`): mutations are logged
automatically by `ReactQueryProvider` as `[action] <meta.action> start | success | error` — give each new
mutation `meta: { action: "area.name" }` — and one-off actions (sign-out, guard redirects) call
`logAction`. Passwords, OTP codes and tokens are masked. HTTP calls are logged separately as `[api:…]` by
the axios interceptors. Dev only (nothing in production builds).

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
- **The auth flow is connected to the real backend** (`MOCK_AUTH` and the simulated hooks are gone).
  `useSignUp` → `POST /auth/signup` (201, 409, 400 with `meta.issues`, 429 after 5/hour/IP; role and names
  go as `role`, `first_name`, `last_name`). Errors come out of `lib/api/errorMessage.ts`
  (`getApiErrorMessage(error, fallback, { 409: "…" })`, keyed by HTTP status; generic NestJS wording like
  "Unauthorized Exception" and the throttler's text are replaced by plain sentences). **Rate limits:** sign-up
  5/hour, OTP verify 10/15 min, resend 3/15 min, login 10/15 min — all per IP, so don't hammer them while testing.
  **Not testable by me without an inbox:** the OTP email. The flows were verified in Chrome with faithful
  mocked responses (network-level interception) plus the live backend for wrong-credentials sign-in; a real
  end-to-end sign-up → email → OTP → dashboard has to be tried by the user.
- `/auth/verified?role=client|provider` is the success screen after OTP (anything but
  `client` shows the provider version). Provider CTA → `/provider/onboarding`, client CTA
  ("Find a provider") → `/client/dashboard/providers` (not built yet);
  `/provider/onboarding` exists. `signUpFlowStore` also carries the role chosen at sign-up.
- **Client vs provider sign-up differ:** the client form (`role=client`) also asks for country +
  state (shared `components/forms/LocationFields.tsx`, mock data in `lib/mock/locations.ts`) and its
  footer reads "Looking for work? Join as a provider"; the provider form has neither (location is
  collected in provider registration). The backend signup doesn't take a location, so the client's
  country/state are collected but unused until there's somewhere to send them.
- **`/auth/sign-in`** (`useSignIn`) → `POST /auth/login` → `{ access_token, refresh_token, user }`: tokens go to
  `authStore` (cookies; **"Remember me" unchecked = the refresh cookie is session-only**, tracked by a
  `gw_remember=0` cookie so refresh rotation keeps the choice), the user is seeded into the session cache,
  and the person lands on `dashboardHomeFor(user.role)`. **403** is ambiguous on the backend (unverified vs
  suspended, same status): matched by wording (`/verif/`, not `/suspend/`) — unverified goes to the OTP step
  and requests a fresh code, suspended shows a message; the code/message it sees is logged
  (`auth.sign-in info`) so the exact `error` code can be pinned down on the first real case. 401 → "Invalid
  email or password." The form ends with "Don't have an account? Sign up" → `/auth/sign-up` (added on request; the mock had none). "Forgot Password?" links to `/auth/forgot-password` (not built; the backend has
  `POST /auth/forgot-password` and `POST /auth/reset-password` with an OTP).
- Desktop content is anchored ~240px from the top (`AuthLayout`, matching every mock and the
  panel headline), not vertically centered; the offset shrinks on short windows so content
  isn't pushed off-screen. Tablet (`md`) stays centered, mobile is top-aligned.
- **`/provider/onboarding` (provider registration) is connected.** Own shell
  (`components/layouts/OnboardingLayout.tsx` — hero + benefits card on the left, no blue panel) under
  `app/provider/(setup)/layout.tsx`, which (like `(status)`) is behind `AuthGate role="provider"`. Submit →
  `PATCH /providers/me/profile` `{ bio, location_country, location_city, skill_slugs }` (`useSaveProviderProfile`,
  shared with Settings), then `/provider/wallet`. **The form has more fields than the backend:** *category* is
  UI-only (it just narrows the skill suggestions and is never sent; on edit it's inferred from the saved skills),
  and *state* + *area* are packed into the one city string as "Area, State" (`lib/providerProfile.ts`
  `encodeCity`/`decodeCity`). Countries are ISO codes already (what the backend wants). States are still a mock list
  for NG/GH/KE/ZA (other countries: free text). **Skills come from the real `GET /skills` catalog**
  (`useSkills`, cached an hour; `SkillsField` is shared by registration and Settings) and are sent as slugs; the
  backend accepts only catalog skills (max 20), so `TagInput` got `allowCustom={false}` (typed text is accepted
  only when it matches a suggestion, other text is dropped on blur). Backend limits: bio ≤ 2000, city ≤ 120. The
  saved-profile response shape (`ProviderProfile`: `skills: {slug,name}[]`, `bio`, `location_*`) is **taken from the
  spec's prose and not yet observed live** (no provider exists in the database to read one from) — check it on the
  first real save; the API log prints the raw response.
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
- **Wallet step is connected** (`useConnectWallet`, `useWallet` in `features/provider/hooks/useWallet.ts`).
  `/provider/wallet` → `/connecting` (does the work, once — guarded against the dev double-effect) →
  `/connected` or `/failed` (`WalletFailed` says *why*: the connecting screen stores a plain-English reason in
  `walletFlowStore`, which now also carries `mode`: `link` | `generate`). **Generate a wallet** = the platform's
  custodial wallet: `POST /wallet/me/bootstrap` (idempotent; friendbot + stablecoin trustline). A wallet that exists but isn't
  fully `funded`/`trustline_created` is **not** a failure (testnet friendbot is flaky): the connected screen shows a
  "Finish setup" notice (`isWalletSetupIncomplete`) that calls bootstrap again. **Connect** = link the
  provider's own wallet: `POST /wallet/link/challenge` → Freighter signs → `POST /wallet/link/verify`; the
  "Use my Freighter account" link fills the field from the extension. The connected screen shows the real
  `GET /wallet/me` address. Errors are mapped in `walletErrorMessage` (409 already linked, no Freighter, wrong
  account, declined); link failures are tagged with their step (`WalletLinkError`: challenge 401 = server rejected the
  request, verify 401/400 = bad signature). **Open:** a user hit a 401 while linking an existing wallet before steps
  were told apart — if it recurs, read the `[api:…]` lines for `/wallet/link/challenge` and `/verify`.
  **Open caveat — Freighter signs SEP-53, the backend documents a raw signature.** Freighter's `signMessage` signs
  `sha256("Stellar Signed Message:\n" + message)`; the backend's docs say to sign the raw challenge bytes
  (`kp.sign(Buffer.from(challenge))`). If it only verifies raw signatures, linking with Freighter will fail at
  `verify` (401 "couldn't verify the signature") until the backend also accepts SEP-53
  (`Keypair.verifyMessage`). Can't be settled without a real Freighter + provider account — **the first real
  attempt decides it**; `lib/freighter.ts` documents this. (I initially recommended Freighter without checking
  this; the user chose it anyway.) Custodial "Generate" doesn't depend on it. `lib/freighter.ts` wraps the
  extension (`@stellar/freighter-api`, added to `apps/web` — **restart the dev server after `pnpm install`**) and
  honours a dev-only `window.__GWANI_FREIGHTER__` stand-in, which is how it's tested without the extension.
  The support link on the failed screen uses a placeholder address, `SUPPORT_EMAIL` in `lib/site.ts`.
- If a freshly added route 404s in `next dev` while `next build` lists it, the dev cache is stale —
  restart the server (deleting `apps/web/.next/dev` if needed).
- **Not-found, error and loading are branded, not generic.** `components/StatusScreen.tsx`
  renders the auth hero's "Verified Provider" card gone wrong (404 = unverified, 0.0 stars,
  0 completed jobs; error = warning badge + escrow reassurance). `app/loading.tsx` uses
  `GwaniLoader` from `@repo/ui` (twinkling four-point star with two orbiting nodes, pure
  CSS/SVG, respects reduced motion). The error page's escrow line ("payments held in escrow
  stay protected until you approve a release") is my copy — confirm it's an accurate promise.
  There's no `global-error.tsx` yet (errors thrown in the root layout itself aren't covered).
- **`/auth/verify-otp`** (`useVerifyOtp`, `useResendOtp`) → `POST /auth/verify-otp` `{ email, otp }` and
  `POST /auth/resend-otp` `{ email }`. The email comes from `signUpFlowStore` (sessionStorage). A successful
  verification is the first session: tokens stored, user cached, then `/auth/verified?role=…` for the role
  **the backend reports**. 400 → "That code is invalid or has expired…", 404 → sign up again. The resend
  countdown is a fixed 45s (`RESEND_SECONDS`); the backend doesn't return a TTL (its limit is 3 resends per 15
  min). An empty flow store (direct visit) says "We lost track of your email".
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
  this shell must render them under `lg:hidden`, as `DashboardOverview` does). The bell is static (nothing
  behind it). The header **search is real** (`HeaderSearch`, desktop header only): a combobox listing matching
  dashboard pages and the user's jobs by title/status (`useJobs(role, { enabled })`, fetched only once text is
  typed) and, for clients, a "Find providers for …" row that goes to `/client/dashboard/providers?q=…` (that page
  reads `?q=` and keys the view on it). Arrows/Enter/Escape work; logged as `dashboard.search`. The greeting and
  the header card show the **first name only**. Job card type is deliberately small (16/14/12px on phones,
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
- **Real data** (`features/jobs/hooks/useJobs.ts`, `lib/jobs.ts`): `useJobs("provider"|"client")` = `GET /jobs?role=…&limit=50`
  following `next_cursor` (≤10 pages), newest first, refreshing every 30s while any job is mid-flight; a provider's
  list drops `POSTED` jobs (the backend also returns open jobs "available to bid on" — those aren't theirs).
  `useJob`/`useJobTransitions` refresh every 15s while a job is active. `toDashboardJob` maps a `Job` to what the cards
  need; `DashboardJob` has **no client name, location or category** because the backend's job has none. Every
  list/detail has a skeleton, a retry on error and an empty state (`components/QueryState.tsx`). The greeting
  follows local time (`useGreeting`). The pager (`Pagination`, `@repo/ui`) is shown only below `lg` on the overview,
  as in the mocks; desktop relies on "View all".
- `JobStatusBadge` (`@repo/ui`) fixes the status → label/colour mapping used everywhere: FUNDED
  "Payment Secured" (green), PROVIDER_SELECTED "Provider Selected" and IN_PROGRESS "In Progress"
  (orange), plus my choices for the rest (POSTED "Open", COMPLETED/PAID green, DISPUTED, CANCELLED).
- **Profile** (`features/dashboard/components/profile/`): real — identity from `/users/me`; bio, skills, location,
  reputation and `jobs_completed` from `GET /providers/me/profile` (404 = "Finish setting up your profile" → onboarding);
  address from `GET /wallet/me`; work history from the provider's COMPLETED/PAID jobs (no client names). Headline =
  first skill; location = city + country name. Shares its parts (`ProfileParts`: identity, reputation, About, Skills)
  with the client's provider preview. COMPLETED is green like PAID. `StarRating` (`@repo/ui`) is display-only,
  whole stars. The "Profile" h1 is `sr-only` on phones.
- **My Jobs** (`JobsView` → shared `JobsBoard`, real): status tabs (accessible tablist, arrow keys) over
  `useJobs`, 10 per page, pager at every size. Tab mapping is `JOB_FILTERS` in `lib/jobs.ts` (In Progress =
  PROVIDER_SELECTED/FUNDED/IN_PROGRESS, Completed = COMPLETED/PAID, **On Hold = DISPUTED** — the backend has no
  on-hold). `JobsBoard` takes `loading`/`loadingState`/`error` so the title and tabs stay while the list loads.
- **Job detail** (`jobs/{JobDetailView,JobTimeline,CompleteJobDialog,ConfirmJobActionDialog}`, shared by both roles:
  `/provider/dashboard/jobs/[id]` and `/client/dashboard/jobs/[id]`): `GET /jobs/{id}` + `GET /jobs/{id}/transitions`.
  The six-step timeline now has **real dates** (`buildTimeline`: reached = the job got there or further; each step
  dated by the transition into it; DISPUTED shows through Completed; CANCELLED only what it reached). 404 → the
  branded not-found page. **Actions by role and status:** provider — *Mark as Completed* (IN_PROGRESS; the
  designed confirm → success dialog; `POST /jobs/{id}/mark-completed`) and *Raise a dispute* (COMPLETED); client —
  *Fund escrow* (PROVIDER_SELECTED; `POST /jobs/{id}/escrow/fund`; 422 = "insufficient balance or no trustline"),
  *Release payment* (COMPLETED; `escrow/release`, irreversible), *Raise a dispute* (COMPLETED; `/dispute`), *Find a
  provider* (POSTED). Fund/Release/Dispute have **no designs** — they use the completion dialog's frame
  (`ConfirmJobActionDialog`) and the provider layout. Errors show inside the dialog; 409 (the other side just
  acted) refreshes the job. **The "Reject this Job" dialog from the mocks was removed** (no backend endpoint: providers
  can only `mark-completed`; `dispute` only works on COMPLETED jobs) — it needs something like `POST /jobs/{id}/reject
  { reason }` plus a refund; restore it from git history (`RejectJobDialog`, `rejectJobSchema` still exists).
  A round back button beside the logo (`HeaderBackButton`).
- **Wallet** (`wallet/{WalletView,BalanceCard,RecentTransactions}`, both roles via `WalletView role`): the address, type,
  funded state and **USDC balance** (`usdc_balance`, a decimal string) are real (`GET /wallet/me`); the banner reads
  "Wallet Balance". **The backend still has no transactions endpoint**, so the two tiles and the list are *derived from
  the jobs list and labelled as what they are*: provider — Pending Earnings (COMPLETED, awaiting release), In Escrow
  (FUNDED + IN_PROGRESS); client — Awaiting Your Release (COMPLETED), In Escrow. "Recent Transactions" = the paid
  jobs (released escrow). **Never cached (the user's call):** `useWallet` is `staleTime: 0`, `gcTime: 0`,
  refetch-on-mount/focus, and on this page (`live: true`, also for `useJobs`) re-fetched every 15s; job actions
  (`refreshJobs`) invalidate the wallet too, since escrow moves money. **Withdraw** (provider) toasts "not available yet"; a client with an unfunded custodial wallet gets **Set up
  wallet** (`POST /wallet/me/bootstrap`), needed before funding escrow. The client wallet page has no design — it is the
  provider's. If the backend adds a balance/transactions endpoint, swap the derivation in `WalletView`.
- Auth: both dashboards sit behind `AuthGate` (see "App routing"); the header name, greeting and settings
  identity are the signed-in user's. "Logout" calls `POST /auth/logout`, clears tokens and the query cache.
  Avatars are initials — the mock's desktop avatar image wasn't supplied. The bell's badge is 0 (no
  notifications endpoint exists), so no fake count shows on a real account.

## App routing

- **Role-prefixed trees, not a shared URL:** `/provider/dashboard/*` and `/client/dashboard/*`
  (recommendation agreed with the user). A role is fixed at signup, the two dashboards' pages differ a
  lot, and a role in the URL means no wrong-dashboard flash and a simple per-prefix guard. Both use one
  frame (`DashboardShell role=…`, `features/dashboard/config.ts`).
- **`/` in apps/web is a router, not a page** (`features/auth/components/RoleRedirect`): signed in →
  `dashboardHomeFor(role)`, otherwise → `/auth/sign-in`. The public site is `apps/landing`. ADMIN has no
  dashboard here (its own app), so it falls back to sign-in.
- **The role is the signed-in user's** (`useCurrentUser()` in `features/auth/hooks/useSession.ts`: one of
  `loading | unauthenticated | error | authenticated`, reading `GET /users/me`). The temporary mock session
  store is deleted.
- **Guards are live**: `AuthGate` (`features/auth/components/AuthGate.tsx`) wraps each dashboard layout —
  signed out → `/auth/sign-in`; signed in as the other role → their own dashboard; profile failed to load
  (network/5xx) → a retry screen rather than a bounce. It's a client-side guard (tokens are cookies read in
  the browser), so it stops strangers *seeing* screens; the data is protected by the JWT server-side. An
  expired access token is refreshed automatically before anything renders (`AuthProvider` → `refreshSession`,
  cross-tab lock); a rejected refresh clears the session. The onboarding and wallet screens
  (`app/provider/(setup)`, `(status)`) are behind it too. Signed-in users visiting `/auth/*` aren't redirected yet.
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
  (`.../jobs`), Post a New Job (`.../jobs/new`) Settings, the job detail (`.../jobs/[id]`) and Wallet. Not built: the
  client's Profile and Help (menu items that hit the branded 404). Everything in the "Provider
  dashboard" notes about the frame (fixed floating cards, spacing constants, mobile drawer, bell/avatar
  under `lg:hidden`) applies here too.
- **Overview** (`client/{ClientOverview,ClientJobCard,QuickActions}`, real): greeting; Active Jobs (a provider is chosen
  and the job isn't finished), Completed Jobs (COMPLETED + PAID), Total Spent (PAID); Quick Actions; the active jobs.
  Job cards show title, amount, posted date and status only (no provider name/category/location — not on a job).
  Not built: the client's Profile and Help pages.
- **Find Providers** (`client/providers/{FindProvidersView,ProviderCard,FilterPill}`, real): `GET /providers/discover`
  (public; `skill` slug partial, `country`, `city` partial, `min_reputation`, `page`, `page_size`). The chips are native
  `<select>`s over a styled pill: **All Skills** (the real `GET /skills` catalog — the mock's "categories" don't exist on
  the backend), **Location** (country), **Rating** (min reputation). The text box can't be one server query: with text,
  `useProviderSearch` runs two (skill match, city match — names can't be searched) and pages the merge; with no text it's one paged request and the count/pager are the server's. Text is
  debounced 350ms. The trailing "Filter" chip has no design (toasts "coming soon"). Avatars are initials; "what they
  do" is the first skill; rows a profile has nothing for are left out. Names/skills come from each visible row's full profile (see "Real
  provider shapes").
- **Provider preview** (`.../providers/[id]`, `ProviderPreviewView`, real): `GET /providers/{id}` — identity, reputation,
  About, Skills, and the provider's (public) wallet address card. There's **no public work history**.
  "Hire Provider" → `/client/dashboard/jobs/new?provider={id}`; 404 → the branded not-found page.
- **My Jobs (client)** (`ClientJobsView`, real): the shared `JobsBoard` with client job cards and "Post a New Job"
  opposite the title.
- **Post a New Job** (`PostJobForm`, `usePostJob`, validation `lib/validations/jobValidations.ts`, real): fields as designed;
  the provider field is a **combobox** (`Combobox`, `@repo/ui` — open it like a select or type to narrow: every typed
  word must match the name or the "trade · place" line, accents/case ignored; only picking sets the value, half-typed
  text reverts on blur) over the first **20** providers from discover (`useProviderOptions`; each needs a profile fetch
  for its name, so it isn't raised) plus the `?provider=` one fetched by id — a provider beyond those 20 can't be
  found by name here (the backend can't search names); Find Providers is the way to reach them. **Submitting is two
  calls:** `POST /jobs` `{ title (3–200), description (10–5000), price_amount (decimal string ≤7 places), price_asset:
  "USDC" }`, then `POST /jobs/{id}/select-provider` `{ provider_id }` (the provider's **user** id), then it lands on
  the job page where **Fund escrow** is offered. If the job is created but choosing the provider fails it still
  lands on the job, saying the job was saved and why the provider wasn't assigned. 403 → "Only client accounts can
  post jobs". The button still reads "Next" (the design's label).
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
    `PATCH /users/me` takes only the names and there's no email-change flow. Avatar: pick an image (PNG/JPG/WebP ≤5 MB) → **real upload** (`POST /files/request-upload`, purpose `AVATAR`, then a PUT to the presigned storage URL) and it previews at once. **Showing it back is a workaround:** nothing on the user or provider profile links to an avatar file, so the file id is kept in localStorage per user and shown via `GET /files/{id}/download-url` — only in this browser and only on this screen (`useAvatar`). The storage bucket must allow browser uploads (CORS) — unverified. Initials until then (the mock's 3D avatar isn't an asset).
  - Provider Information: the registration form's fields on the **real saved profile** (`GET`/`PATCH
    /providers/me/profile`; skeleton while loading, retry on error, an empty form when the provider has no
    profile yet), same schema and the same category/state/area mapping as registration.
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
- **Screens not built:** the client's Profile and Help pages, and the "success payments" modal (its image never
  arrived). Undesigned but built anyway: the client's job detail, Fund/Release/Dispute dialogs and the client wallet.

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
