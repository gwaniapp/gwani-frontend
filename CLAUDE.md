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
dispute force-transition) — `apps/admin` calls it; see "Admin app" below.

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
- **Avatar** — real: `POST /users/me/profile-picture` (multipart `file`; the server re-compresses it under 1 MB and keeps
  it on the user) and `GET /users/me/profile-picture` (a fresh 7-day URL; 404 = none). Shown in the header, Settings and
  the own-profile page (`useProfilePicture`/`useAvatar`). It goes through the proxy as multipart — the axios call must set
  `Content-Type: multipart/form-data` explicitly (the instance default is JSON, which would flatten the FormData). The old
  `/files/request-upload` route no longer exists in the spec.
- **No backend endpoint, so not offered (the UI was trimmed to match, 2026-09-21):** a provider *rejecting* a job (the dialog was
  removed; needs e.g. `POST /jobs/{id}/reject`), an old-password change (done via the emailed-code reset instead), notification
  *preferences* (removed; the notification *inbox* itself is real since 2026-09-21 — see "Notifications"), self-service account deletion (an email to support instead), and the mock's extra
  "Filter" chip on Find Providers. (Withdraw is real via `POST /wallet/transfer`.) (Wallet **balance**, **transactions** and a provider's **escrow** are real since 2026-09-21 —
  `GET /wallet/me` returns `usdc_balance` and `funds_in_escrow`, `GET /wallet/transactions` the list),
  a provider's trade title (first skill is used) and *public* work history.
  (Since 2026-09-21 the job detail returns the client's name and the provider's location, shown on the detail page; the job
  *cards* still show neither — `GET /jobs/client/dashboard/jobs` and `GET /providers/provider/dashboard/jobs` carry
  them, and `GET /providers/me/work-history` + `GET /providers/provider/dashboard/profile` exist but are not used.)
- **Real provider shapes (confirmed live 2026-09-21; the OpenAPI prose lags behind).** The full profile (`GET /providers/{id}`, public, and
  `/providers/me/profile`) is now **flat**: `{ id, first_name, last_name, profile_picture_url, bio, wallet_address, wallet_type, skills:
  [{id,slug,name}], skill_category, reputation_score: "0.00", completed_jobs, location: {country,state,city,area}, job_history:
  [{id,title,status,date}] }` (up to 10 recent finished jobs, no price/client). It used to nest a `user` row that leaked the password hash
  and email — **that leak is fixed**. Two list shapes: the public directory row (`GET /providers/discover`) is still only `{ user_id,
  bio, skill_category, location_*, reputation_score, completed_jobs_count }` (no name, picture or skills), and the **client-only**
  `GET /providers/search` (params `query` — free text over name, category and location, *not* skills —, `category`, `location`,
  `min_reputation`, `order`, paging) returns `{ id, first_name, last_name, profile_picture_url, skill_category, reputation_score,
  completed_jobs, location }`. `normalizeProvider` (`lib/providers.ts`) turns any of these (and the old nested one) into the app's
  `ProviderProfile`; hooks normalize and screens never read raw shapes. `GET /skills` now returns `{ items }` (spec says array; `useSkills`
  accepts both). **Find Providers** (`useProviderSearch`): no text → one paged directory request; text → `/providers/search` ∪ the
  providers whose skill matches (directory, slug), narrowed by the country chip; with a skill chip, the skill's providers ∩ the search
  matches; if the search endpoint fails it falls back to a directory city match. Each visible row is then filled in from
  `GET /providers/{id}` (skills, bio, picture). `select-provider` takes the provider's **user id**. The profile pictures are public presigned
  URLs (7 days) and are shown on the cards, the preview and the own profile. The provider preview also lists `job_history` (no amounts).
- **Still unobserved:** cursor `GET /jobs` with real jobs (the empty list is `{items: [], next_cursor: null}`). The
  `[api:…]` console log prints every raw response — check it on first real use.
- **BACKEND BUGS found live on 2026-09-21 (with the real test accounts) — the backend team's to fix:**
  1. **`POST /jobs/{id}/escrow/fund` returns 500 *after* locking the money.** The on-chain transaction succeeds (a
     claimable balance is created for provider + client) and then the backend throws `{"message":"Custom Id cannot contain :"}`
     (BullMQ rejects a job id containing a colon — use another separator). The escrow row is stored as `FAILED`, the job
     stays `PROVIDER_SELECTED`, so the UI offers "Fund escrow" again and every retry locks more funds. Reproduced twice
     (jobs 3a6face4… for 2,300 and c20db0c3… for 1; Horizon confirms both). The lifecycle can't get past funding until fixed.
     The app now words any 5xx on fund/release as "may already have gone through — check Recent Transactions".
  2. **The escrow/"USDC" asset is native XLM:** the wallets hold only XLM (no USDC trustline; `trustline_created: false`)
     and `usdc_balance` is really the XLM balance; the claimable balances are `native`. The app labels amounts USDC as the API does.
  3. ~~Public `GET /providers/{id}` returned the whole user row incl. `email` and `password_hash`~~ — **fixed** (flat shape, 2026-09-21).
  4. `GET /jobs/{id}`'s `timeline` leaves the *current* status `completed: false`, and `/jobs/{id}/transitions` is empty
     (no select-provider transition recorded) — the app derives "reached" from the status and uses the timeline's dates only.
  5. The test provider's profile has `location_country: "BD"` with city "Warri, Delta" (account data — the form has no state
     list for Bangladesh, so it was probably picked by mistake).
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
              dashboards).
  landing/    the public marketing site (Next.js 16, port 3002) — built, see
              "Landing page" below.
  admin/      the staff console (Next.js 16, port 3001) — built, see "Admin app" below.
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

## Admin app (`apps/admin`)

The staff console, on the same stack and design system as `apps/web` (Next.js 16, Tailwind v4, `@repo/ui`, Manrope, indigo). `pnpm --filter admin dev` runs it on **port 3001**
(web is 3000). **Layout** (`features/shell/`): a fixed full-height `w-64` sidebar (`SidebarContent`: brand, the five pages with a live red count on Disputes, and pinned at the bottom
the signed-in admin + Logout, which asks first), a sticky frosted top bar (`TopBar`: breadcrumb "Console › Page" and a red "N disputes need review" shortcut when any exist; on
phones the hamburger + logo), and pages as white cards (`Panel`, `TableFrame`) on the tinted page in a `max-w-7xl` column — keep the sidebar's `w-64` and the content's `lg:pl-64` in
sync (`AdminShell`). Below `lg` the sidebar is a slide-in menu with the same contents. It reuses the web app's infrastructure by *copy* (there is no shared package yet): the axios
instances with bearer + refresh rotation, `authStore`, the same-origin `/api/proxy`, `errorMessage`, `logger`, `format`, `ConfirmLogoutDialog`, `StatCard`, `QueryState`. What differs:
**cookie names are `gw_admin_*`** (cookies are per host, not per port, so the two apps would otherwise share and overwrite each other's session), the refresh lock key, and there is
no "remember me" (the refresh cookie is session-only). It has its own `error.tsx` and `not-found.tsx`.

- **Auth:** `/auth/sign-in` uses the ordinary `POST /auth/login`; only an `ADMIN` account gets in — anyone else has the freshly issued refresh token **revoked again** and is told this
  console is for staff. `AuthGate` (the `(admin)` route-group layout) requires role ADMIN and clears a stale non-admin session. **There is no HTTP way to create the first admin**
  (the backend does it out-of-band), so this console could only be tested with mocked responses plus a live check that a real client account is refused. An admin can promote others.
- **Pages** (`app/(admin)/…`, data in `features/admin/hooks/useAdminData.ts`): **Overview** (`GET /admin/stats`: user/job counts, paid volume and escrow per asset, users by role, jobs by status, a
  disputes banner); **Users** (`GET /admin/users`: search on email/name, role and suspended filters, server paging; a *Manage* dialog with details and the actions — suspend / reinstate,
  make admin / remove admin role (`{ role: CLIENT|PROVIDER }`), export data (downloads the JSON of `GET …/export`), erase personal data (`DELETE`; you must type the user's email); an admin can't be
  suspended or erased (the backend 400s — demote first) and can't act on their own account); **Jobs** (`GET /admin/jobs` by status; the job dialog shows details, the status history from
  `GET /jobs/{id}/transitions` where a dispute's reason lives, the payment records from `GET /jobs/{id}/escrow`, and the **status override** `POST /admin/jobs/{id}/force-transition` `{ to, note≤500 }`);
  **Disputes** (`GET /admin/disputes`, opens the same job dialog with *Release to provider* → PAID and *Refund the client* → CANCELLED shortcuts; a note is **required** when resolving a dispute);
  **Audit log** (`GET /admin/audit-log`, filters action / target_type, `limit`+`offset` paging with Previous/Next since there is no total).
- Every state-changing action goes through a confirm step *inside* the dialog (`ConfirmStep`: description, optional note for the audit log, optional type-to-confirm). List endpoints are read
  with `readPage` (accepts `{data|items, total, page, page_size}` or a bare array — the spec says `data`, the rest of the API says `items`). **Unobserved shapes** (no admin account to read them):
  the user/job/audit rows and `stats.volume` (read defensively: `volumeEntries` accepts an object or a list) — check the `[api:…]` console log on first real use.
- **Modals** (`AdminDialog`): a **bottom sheet on phones** (pinned to the bottom, full width, slide-up, drag-handle bar, rounded top) and a centred modal from `sm`; capped at `92dvh`/`88dvh`
  (`dvh`, so mobile browser chrome doesn't hide the bottom), the header stays put and only the body scrolls, so a long job history or a landscape phone never pushes the buttons out of reach.
  Verified with a matrix at 360×640, 390×844, 812×375 (landscape), 768×1024 and 1280×800: dialog inside the viewport, title visible, confirm/erase/apply controls reachable after scrolling,
  no sideways scroll with very long names/emails/titles.
- The table frame uses `[contain:paint]`: without it Chrome's mobile emulation widened the whole page to the table's min-width even though the frame scrolls on its own.

## Landing page (`apps/landing`)

The public marketing site (Next.js 16, Tailwind v4, `@repo/ui`, Manrope). `pnpm --filter landing dev` runs it on **port 3002** (web is 3000, admin 3001). No auth, no API calls,
no TanStack Query — it's a static page, so its `package.json` only carries `next`/`react`/`@repo/ui`/`lucide-react`. Built from a Figma frame ("Gwani Landing — Desktop", node
`735:10524` in a file named "Peakline" that also holds an unrelated gwani-specific export) at a point where the Figma API had hit its plan's rate limit — recovered by reading the
earlier full-dump tool-result file instead of re-fetching, so the text/layout/colors are faithful to the design but a few gaps are this app's own judgment calls, noted below.
Every "Sign in" / "Get Started" / "Become a…" CTA crosses to `apps/web`'s real auth routes via `lib/appUrl.ts` (`NEXT_PUBLIC_APP_URL`, defaults to `localhost:3000` in dev) — there's
nothing to sign in *to* here.

- **Sections** (`features/landing/components/`, composed in `LandingPage.tsx`): `Navbar` (fixed, mobile slide-in panel) → `Hero` (primary-800 band, the exported `hero-img.svg`
  collage) → `Solutions` ("We have solutions for your problems", `solutions-img.png`) → `Categories` ("Our categories", a tinted band) → `HowItWorks` ("Easiest way to get a service",
  the exported `easy-get-service-img.svg` browser mockup) → `AudienceCta` (the "For Clients" / "For Providers" dual cards, `reliable-payment-img.svg` / `reliable-customers-img.svg`)
  → `Footer`. The six image assets live in `packages/ui/src/assets/images/` (the user's own Figma exports) and are rendered as plain `<img src={...svg}.src>`, matching `Logo`'s own
  pattern — not `next/image`, since local SVGs need `dangerouslyAllowSVG` to run through Next's optimizer and these are trusted static assets anyway.
- **Two content gaps the Figma export didn't resolve, filled in rather than left as template placeholders:** the "Our categories" grid's per-card names (only "Design" and a
  "View all categories" tile were recoverable; the rest fell back to an ambiguous template default) now use gwani's real category groups from `lib/mock/providerOptions.ts`
  (`apps/web`) — 8 of the 9 groups get a tile, "View all categories" covers the rest. The footer's "Services" column was Figma-template copy unrelated to this product ("Digital
  Marketing", "SEO for Business", "UI Design") — replaced with real category links instead of carried over as-is.
- **The hero's "12k+ professionals" pill is placeholder marketing copy** (baked into `people.svg` itself, not editable from this code) — there's no real user count yet for a
  20-day PoC. Re-export the asset with a real figure, or drop the pill, once there's data to back it.
- **Responsive**: the Figma source is desktop-only (1440px designed width), so every breakpoint below that is this app's own design, mobile-first (`sm`/`lg`/`xl`). The two
  `AudienceCta` cards go side-by-side only from `xl` (not `lg`) — below that they're full-width and roomy, so the image+text row inside each card also waits for `xl` to match; at
  `xl` a card's own text column is only ~250px wide, so its CTA button additionally overrides the base `Button`'s `whitespace-nowrap` (`whitespace-normal`) as a safety net. Verified
  with headless Chrome across 375–1920px: no horizontal scroll, no console errors, no layout overflow (checked via `scrollWidth` vs `clientWidth` on every major container, not just
  the viewport — a flexbox child without `min-w-0` silently overflowed its card before this was caught that way).

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

## Notifications (web app)

The backend added an inbox for clients and providers (`GET /notifications` paged newest-first, `GET /notifications/{id}`, `PATCH /notifications/{id}/read`, `DELETE /notifications/{id}` — a
soft delete). The header bell is real again (`features/notifications/`, desktop header card + the mobile overview row): a badge with the unread count (there is **no unread-count
endpoint**, so it counts the unread ones among the latest 30; polled every 30s and on focus, never cached) and a right-hand slide-in panel with the list — tapping an item marks it read and,
when it names a job, opens `/{role}/dashboard/jobs/{id}`; each row has a delete; "Mark all as read" PATCHes each unread one (no bulk endpoint). **The item shape is unobserved** (both test
accounts had empty inboxes and the spec doesn't describe it): `lib/notifications.ts` reads `title`/`message`/`body`, falls back to a humanised `type`, finds a job in `job_id` or `data.job_id`/
`metadata.job_id`. Check the `[api:…]` log on the first real notification. Admins have no inbox in the console (the spec says client or provider).

**Modal rule of thumb:** a dialog with its own `DialogContent` overrides must keep the base `overflow-y-auto` + a `dvh` max-height (never `overflow-hidden` on the content), and a grid
dialog needs `grid-cols-[minmax(0,1fr)]` so a long unbreakable title can't widen it past the screen (the job-action dialogs did, on phones and tablets, until 2026-09-21).

## Input validation (all forms)

Shared rules live in `lib/validations/rules.ts` and are used by every schema: **names** 1–60 letters/spaces/hyphens/apostrophes (no digits or
symbols), **email** ≤254, **password** the backend's rules + ≤128, **place** fields ≤120, **amount** numbers only (`sanitizeAmount` drops anything but
digits and one "." as it is typed or pasted, ≤9 whole digits, ≤7 decimals, > 0), **one-time codes** digits only (`digitsOnly`; no `maxLength` on those
inputs — the browser would cut a pasted "123 456" before the filter runs), **Stellar address** upper-cased and stripped of spaces (56 chars). Inputs also
carry matching `maxLength`s. Job titles are capped at 80 (`JOB_TITLE_MAX`) and every place that shows a title truncates or wraps it. **Every Logout
button asks first** ("Are you sure you want to log out?", `ConfirmLogoutDialog` — sidebar, mobile menu, account settings).

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
  email or password." The form ends with "Don't have an account? Sign up" → `/auth/sign-up` (added on request; the mock had none). "Forgot Password?" links to `/auth/forgot-password`, which is built (`ForgotPasswordForm`, no mock — it borrows the sign-in look): email → `POST /auth/forgot-password` (always 204), then the 6-digit code + a new password → `POST /auth/reset-password` (revokes every session) → back to sign-in. Hooks: `features/auth/hooks/usePasswordReset.ts`; schemas in `authValidations`.
- Desktop content is anchored ~240px from the top (`AuthLayout`, matching every mock and the
  panel headline), not vertically centered; the offset shrinks on short windows so content
  isn't pushed off-screen. Tablet (`md`) stays centered, mobile is top-aligned.
- **`/provider/onboarding` (provider registration) is connected.** Own shell
  (`components/layouts/OnboardingLayout.tsx` — hero + benefits card on the left, no blue panel) under
  `app/provider/(setup)/layout.tsx`, which (like `(status)`) is behind `AuthGate role="provider"`. Submit →
  `PATCH /providers/me/profile` `{ bio, skill_category, location_country, location_state, location_area, location_city,
  skill_slugs }` (`useSaveProviderProfile`, shared with Settings), then `/provider/wallet`. **Since 2026-09-21 the backend has
  the fields the form needs:** *category* is sent as `skill_category` (its label; it also still steers the skill suggestions),
  *state* and *area* go to `location_state`/`location_area`, and the city is the area (or the state) so the directory's city
  search matches (`lib/providerProfile.ts`; `decodeCity` still reads older profiles that packed "Area, State" into the city). Countries are ISO codes already (what the backend wants). States are still a mock list
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
  this shell must render them under `lg:hidden`, as `DashboardOverview` does). The **notification bell** is real (see "Notifications"). The header **search is real** (`HeaderSearch`, desktop header only): a combobox listing matching
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
- **Real data** (`features/jobs/hooks/useJobs.ts`, `lib/jobs.ts`): `useJobs("provider"|"client")` reads the **dashboard job lists**
  — `GET /providers/provider/dashboard/jobs` (a provider's assigned jobs, each with its **client's name**) and
  `GET /jobs/client/dashboard/jobs` (all of a client's jobs, each with the **assigned provider's name and location**, null until
  chosen) — paged 50 at a time (≤10 pages), newest first, refreshing every 30s while any job is mid-flight; a provider with no
  profile gets a 404 = no jobs. Rows are shaped like a `Job` (no `description`). `useJob`/`useJobTransitions` refresh every
  15s while a job is active. `toDashboardJob` maps a `Job` to what the cards need: `DashboardJob` carries `person` (the other
  side's name), `place` (client cards only — a provider's list repeats *their own* location, which says nothing), and `dueDate`.
  Every list/detail has a skeleton, a retry on error and an empty state (`components/QueryState.tsx`). The greeting
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
  designed confirm → success dialog; `POST /jobs/{id}/mark-completed`); client — *Fund escrow* (PROVIDER_SELECTED; `POST /jobs/{id}/escrow/fund`;
  422 = "insufficient balance or no trustline"), *Release payment* (COMPLETED; `escrow/release`, irreversible); **both** — *Raise a dispute* while the
  job is FUNDED, IN_PROGRESS or COMPLETED, which **needs a written reason** (`POST /jobs/{id}/dispute` `{ reason }`, 10–1000 chars — the dialog has a
  reason box and checks the length before sending). **Funding is asynchronous:** `escrow/fund` only submits the transaction (`{ tx_hash }`); the job
  moves to FUNDED then IN_PROGRESS later, so the client's job page reads `GET /jobs/{id}/escrow` (`useJobEscrow`, polled every 5s while pending): pending →
  "waiting for confirmation" note and no Fund button; failed → a warning to check Recent Transactions first, and the button reads "Try funding
  again". Fund/Release/Dispute have **no designs** — they use the completion dialog's frame (`ConfirmJobActionDialog`, whose typed reason/error live in
  its body so every opening starts clean) and the provider layout. Errors show inside the dialog; 409 (the other side just
  acted) refreshes the job. **The "Reject this Job" dialog from the mocks was removed** (no backend endpoint: providers
  can only `mark-completed`; `dispute` only works on COMPLETED jobs) — it needs something like `POST /jobs/{id}/reject
  { reason }` plus a refund; restore it from git history (`RejectJobDialog`, `rejectJobSchema` still exists).
  A round back button beside the logo (`HeaderBackButton`).
- **Wallet** (`wallet/{WalletView,BalanceCard,RecentTransactions}`, both roles via `WalletView role`): the address, type,
  funded state, **USDC balance** (`usdc_balance`), a provider's **escrow** (`funds_in_escrow`) and the **transaction list**
  (`GET /wallet/transactions`: a client's FUND/REFUND, a provider's RELEASE, each with the backend's own status —
  FAILED shows as a red "Failed") are real; the banner reads "Wallet Balance". Only the tile *Pending Earnings / Awaiting
  Your Release* (COMPLETED jobs) and a **client's** In Escrow (the API reports 0 for clients) are derived from the jobs list.
  **Never cached (the user's call):** `useWallet`/`useWalletTransactions` are `staleTime: 0`, `gcTime: 0`, refetch-on-mount/
  focus, and on this page (`live: true`, also for `useJobs`) re-fetched every 15s; job actions (`refreshJobs`) invalidate the
  wallet too. **Withdraw** (both roles; `WithdrawDialog`, `POST /wallet/transfer` `{ destination, amount, memo? }`) sends the on-hand balance to any Stellar address
  (validated: G-address, not your own, amount ≤ available with 7 decimals, memo ≤ 28; "Max" fills the balance). A custodial wallet answers `{ tx_hash }`
  (shown with a testnet explorer link); a *linked* wallet gets `{ type: "unsigned_xdr", xdr, message }` to copy and sign in its own wallet; a 500
  means the network refused it (destination needs a trustline). The "Verified" only when the wallet is ready, "Setup incomplete"
  when `trustline_created` is false (no badge on someone else's wallet). A wallet with `trustline_created: false` shows **Set up
  wallet** (either role; `POST /wallet/generate` if the account has no wallet, else `/wallet/me/bootstrap`). The client wallet page
  has no design — it is the provider's.
- **Dashboard numbers are the server's** (`features/dashboard/hooks/useDashboardStats.ts`): provider overview =
  `GET /providers/provider/dashboard/stats` (active, completed, pending_payments — a *count* —, reputation); client overview =
  `GET /jobs/client/dashboard/stats` (active — posted and not yet paid, excluding disputed/cancelled —, completed, total_spent).
  The client's active-job cards use the same definition so the count and the cards agree.
- Auth: both dashboards sit behind `AuthGate` (see "App routing"); the header name, greeting and settings
  identity are the signed-in user's. "Logout" calls `POST /auth/logout`, clears tokens and the query cache.
  Avatars are initials — the mock's desktop avatar image wasn't supplied. The bell's badge is 0 (no
  notifications endpoint existed then); it now shows the real unread count (see "Notifications").

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
  (`.../jobs`), Post a New Job (`.../jobs/new`) Settings, the job detail (`.../jobs/[id]`), Wallet and Profile (`.../profile`,
  added 2026-09-22 — see below). Not built: Help (hits the branded 404, undesigned, out of scope for now). Everything in the "Provider
  dashboard" notes about the frame (fixed floating cards, spacing constants, mobile drawer, bell/avatar
  under `lg:hidden`) applies here too.
- **Overview** (`client/{ClientOverview,ClientJobCard,QuickActions}`, real): greeting; Active Jobs (a provider is chosen
  and the job isn't finished), Completed Jobs (COMPLETED + PAID), Total Spent (PAID); Quick Actions; the active jobs.
  Job cards show title, amount, posted (and due) date, the assigned provider's name and place once chosen, and status.
- **Profile** (`client/ClientProfileView`, real, no mock — the client menu linked here from the start but the page was
  never built, so it 404ed; added 2026-09-22): identity from `GET /users/me` (name, and `location` via
  `formatUserLocation`, both real fields on that endpoint), a stats card reusing the overview's own numbers
  (`useClientStats` — Total Spent, Completed Jobs; `StatRow` from `ProfileParts`, now exported), the wallet address
  (`GET /wallet/me`), and a history of the client's `PAID` jobs with the assigned provider's name
  (`WorkHistory`, `counterpartyLabel="Provider"`). Deliberately narrower than the provider's own profile — a client
  has no bio, skills or reputation, so those cards and the star row don't appear (`ProfileIdentity`'s `rating`/
  `jobsDone` are now optional for this reason; the row is only rendered when a rating is given).
  `WorkHistoryItem.clientName` was renamed to `counterpartyName` for this (a provider's own Work History list now
  also shows the client's name, via the same field, using the client info the dashboard job list already carries).
- **Find Providers** (`client/providers/{FindProvidersView,ProviderCard,FilterPill}`, real): `GET /providers/discover`
  (public; `skill` slug partial, `country`, `city` partial, `min_reputation`, `page`, `page_size`). The chips are native
  `<select>`s over a styled pill: **All Skills** (the real `GET /skills` catalog — the mock's "categories" don't exist on
  the backend), **Location** (country), **Rating** (min reputation). The text box can't be one server query: with text,
  `useProviderSearch` runs two (skill match, city match — names can't be searched) and pages the merge; with no text it's one paged request and the count/pager are the server's. Text is
  debounced 350ms. The mock's trailing "Filter" chip was removed (no further filter exists on the backend). Avatars are initials; "what they
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
  found by name here (the backend can't search names); Find Providers is the way to reach them. **Submitting is one call:** `POST /jobs` `{ provider_id, title
  (3–200; the form caps it at **80**, `JOB_TITLE_MAX`, with a live counter), description (10–5000), skill_category?, due_date?, price_amount (decimal
  string ≤7 places, ≤9 whole digits, typed as numbers only), price_asset: "USDC" }` — with `provider_id` the job is created *already assigned*
  (`PROVIDER_SELECTED`), so there is no separate select-provider call to fail halfway. **Start date + Duration (days):** the backend has one
  date field, `due_date` (target completion, ISO 8601), no start date or duration; the form asks for both (start today or later, 1–365 days) and
  sends start + duration as `due_date` (end of that day, UTC), previewing "The work should be finished by …" (`lib/dates.ts`). Then it lands on the
  job page where **Fund escrow** is offered. 403 → "Only client accounts can post jobs". The button still reads "Next" (the design's label).
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
    `PATCH /users/me` takes only the names and there's no email-change flow. Avatar: pick an image (PNG/JPG/WebP/GIF ≤15 MB) → real upload (see "Avatar" above); it shows at once and on every device. Initials until then. A client's sign-up country/state are now saved with `PATCH /users/me` right after OTP verification (`useVerifyOtp`; the endpoint takes `location_country/state/city/area`).
  - Provider Information: the registration form's fields on the **real saved profile** (`GET`/`PATCH
    /providers/me/profile`; skeleton while loading, retry on error, an empty form when the provider has no
    profile yet), same schema and the same category/state/area mapping as registration.
  - Change Password: **the backend has no old-password + new-password endpoint**, so it runs the emailed-code reset: "Send code" (`POST /auth/forgot-password` to the signed-in user's own email) → 6-digit code + new password (`POST /auth/reset-password`), which **revokes every session**, so the app signs out and goes to sign-in. The mock's Old Password field is gone.
  - **Download Gwani** (desktop sub-nav panel / mobile menu row + sheet; `DownloadApp`): installs the web app on the device (there is no app-store
    listing). `InstallPromptListener` (mounted in the root layout) catches the browser's `beforeinstallprompt` early into `installStore`; with it
    the button opens the browser's install dialog, without it (iPhone, Safari, Firefox) the panel shows the manual "Add to Home Screen" steps, and
    once installed (`appinstalled` / standalone display mode) it says so. `public/favicon/site.webmanifest` now has `id`, `start_url`, `scope`.
    Only Chromium browsers fire the prompt, so it can't be exercised in headless Chrome without dispatching a fake event (how it was tested).
  - The mock's **Account Settings** panel (email-notification switches, localStorage-only) was **removed** — the backend has no preferences.
  - **Delete Account**: the backend has no self-service deletion (admin-side only), so the sheet explains what deleting involves and offers **Email support** (a `mailto:` to `SUPPORT_EMAIL` prefilled with the account email) instead of a fake request. Logout uses the shared `useLogout`.
  - Not in the mocks, so not built: any settings for the client's own profile beyond the above (the mock's
    Provider Information item is providers-only; nothing client-specific was shown).
- **Screens not built:** the client's Help page (undesigned, no backend content for it either), and the "success
  payments" modal (its image never arrived). Undesigned but built anyway: the client's job detail, Fund/Release/
  Dispute dialogs, the client wallet, and (2026-09-22) the client's own Profile page.

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
