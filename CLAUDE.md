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
- **Neutral & secondary**: a standard gray scale, and `secondary-*` currently just mirrors
  `neutral-*` — **placeholders**, not a real brand decision. No secondary brand color or
  distinct neutral tint has been specified. Replace both ramps (values only, in
  `globals.css`) the moment a real secondary color / neutral tint exists — no component
  code needs to change, they only ever reference the token names.
- **No brand assets ported**: peakline's actual logo files, favicon PNGs, and auth
  illustrations were **not** copied (they're peakline's own brand imagery). `Logo` in
  `packages/ui/src/logo.tsx` is a plain text wordmark placeholder; the favicon is a
  generated placeholder SVG. Replace both once real brand assets exist.
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

## Conventions (once real features start)

- Feature-based structure inside apps: `src/features/<domain>/components/`, page files in
  `src/app/**` stay thin.
- Shared visual shells go in `src/components/layouts/`.
- Reuse `StatusPage`/`LoadingBar` from `@repo/ui` for full-page states (already wired into
  `error.tsx`/`not-found.tsx`/`loading.tsx`).
