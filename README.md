# shagan_team

**Shagan Provider Onboarding** - the internal portal Shagan staff use to sell
and provision Shagan POS tenants: record a buyer, create their POS
organisation, then add branches, devices and POS (till) logins.

> Part of the Shagan POS system. Start with the
> [system overview](https://github.com/channyein-thu/shagan_pos/blob/main/docs/OVERVIEW.md)
> in the backend repo. This app only talks to the backend's `/internal/*`
> routes; shop owners and cashiers use
> [shagan-retail](https://github.com/thiri-kyaw-khaing/shagan-retail).

## Who uses it

Shagan staff only (`AdminUser` accounts, email + password). There are no roles:
every admin can do everything.

## Stack

- **Next.js 16** (App Router), **React 19**, TypeScript, Tailwind CSS 4
- **Auth.js v5** (`next-auth` beta) - Credentials provider, JWT sessions
- **Prisma 7** on **SQLite** (`better-sqlite3` adapter) for this app's own data
- Hand-written UI components in `src/components` (no component library)

> Next 16 differs from older Next.js (e.g. `middleware.ts` is now `proxy.ts`).
> Read `node_modules/next/dist/docs/` before changing framework code - see
> `AGENTS.md`.

## Two sources of data

| Data | Lives in | Why |
|---|---|---|
| Admin users, buyers (customers of Shagan), the POS organizations each bought | Prisma / SQLite (`dev.db`) | Shagan's own CRM data - the POS backend doesn't know about it |
| POS organisations, branches, devices, POS accounts | **shagan_pos** backend via `/internal/*` | The backend is the source of truth; this app never stores them |

`BuyerService` links the two: for an organisation, `externalId` is the backend's
org id, and the org's live status is always read from the backend.

### Prisma models

| Model | Purpose |
|---|---|
| `AdminUser` | Portal login (email unique, bcrypt `passwordHash`) |
| `Buyer` | A customer of Shagan: name, email, phone, company, billing address |
| `BuyerService` | Links a buyer to a POS organization in the backend: `serviceType` (always `organization`), `externalId` (the org id), status. Unique on `(serviceType, externalId)` |

## Backend integration

`src/lib/backend/client.ts` (server-only) calls `BACKEND_API_URL` with the
`X-Internal-Key` header. The key never reaches the browser.

| Endpoint | Used for |
|---|---|
| `POST /internal/accounts` | Create an organisation with its owner and service-center logins |
| `GET /internal/organizations` | Org list / live status |
| `PATCH /internal/organizations/{id}/status` | Suspend / activate an org |
| `POST`, `GET /internal/branches` | Create / list branches |
| `POST`, `GET /internal/devices` | Create / list POS devices |
| `POST`, `GET /internal/accounts/pos` | Create / list POS (till) logins |
| `PATCH /internal/accounts/pos/{id}/status` | Suspend / activate a till login |
| `POST /internal/accounts/pos/{id}/reset-password` | Reset a till login's password |

## Screens

| Route | What it does |
|---|---|
| `/login` | Sign in |
| `/` | Buyers list with totals, create buyer |
| `/buyers/[id]` | A buyer's POS organizations; add one |
| `/organizations/[id]` | A POS org from the backend: status, branches, devices, POS accounts (create, suspend, reset password) |

## Run it locally

1. Start the backend (see the
   [shagan_pos README](https://github.com/channyein-thu/shagan_pos#run-it-locally)).
2. Configure:
   ```bash
   npm install          # also runs prisma generate
   cp .env.example .env
   ```
   Fill in `.env`:

   | Variable | Value |
   |---|---|
   | `BACKEND_API_URL` | e.g. `http://localhost:8000` (the example file's value is broken - see below) |
   | `INTERNAL_API_KEY` | Same value as the backend's `INTERNAL_API_KEY` |
   | `AUTH_SECRET` | `npx auth secret` |
   | `DATABASE_URL` | `file:./dev.db` (must not be empty) |
   | `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Your first admin login |
3. Create the database and the first admin:
   ```bash
   npm run db:push
   npm run db:seed
   ```
   If Prisma can't find the database URL or seed command, pass the config
   explicitly: `npx prisma db push --config prisma7.config.ts` (and the same
   for `db seed`).
4. `npm run dev` → http://localhost:3000 (use another port, e.g.
   `npm run dev -- -p 3001`, if shagan-retail is already on 3000).

## Known gaps

**Security**
- Server actions don't call `auth()`; only `src/proxy.ts` guards them.
- Create actions trust `org_id` / `buyer_id` from the form without checking.
- The login `callbackUrl` isn't validated (open redirect).

**Correctness**
- Creating an organisation writes to the backend, then to Prisma; if the Prisma
  write fails the org is left orphaned in the backend.
- Validation is thin (e.g. no password length check when creating a POS login).
- Some actions throw instead of returning an error state.

**Missing features**
- No organisations list page; `/organizations/[id]` loads every org to find
  one (the backend has no get-by-id route - backend recommendation #11).
- No edit / delete for buyers or organizations; no admin user management
  (seed only).
- Owner / service-center logins are created but not shown.

**Repo hygiene**
- `.env.example` has an unclosed `BACKEND_API_URL="` and empty values that
  defeat the code's defaults.
- The root `dev.db` is committed (`.gitignore` only covers `prisma/dev.db`).
- The Prisma config is named `prisma7.config.ts`, not the default
  `prisma.config.ts`.
- No tests.
