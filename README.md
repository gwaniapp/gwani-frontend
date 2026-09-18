# gwani

Turborepo + pnpm monorepo, scaffolded from peakline's structure and design system.
Product brief not yet written — this is infrastructure only.

## Layout

```
apps/
  web/        Next.js 16 app (App Router, React 19, Tailwind v4)
packages/
  ui/                 shared design system (@repo/ui)
  eslint-config/
  typescript-config/
```

## Getting started

```
pnpm install
pnpm dev
```

See [CLAUDE.md](./CLAUDE.md) for the decisions baked into this scaffold.
