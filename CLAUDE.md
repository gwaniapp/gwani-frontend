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
  web/        Next.js 16 app (App Router) — the only app scaffolded so far.
              Start here; add apps/landing or apps/admin later only once a
              real reason exists, same "one app, not one-per-surface" default
              peakline settled on.
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
  (sessionStorage) and pushes to `/auth/verify-otp`. `/auth/sign-in` is linked but not built.
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
  ("Find a provider", a placeholder — only the provider version is designed) → `/providers`;
  neither destination exists yet. `signUpFlowStore` also carries the role chosen at sign-up.
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
  and only the right column scrolls (its scrollbar sits at the window edge); the hero shrinks on
  short windows. Below `lg` the page scrolls normally and the left side is hidden.
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
