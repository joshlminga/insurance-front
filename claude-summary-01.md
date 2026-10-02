# Claude summary 01 — Acensure-Front (offline context pack)

**Purpose:** Give an external agent (Claude Code, etc.) enough **frontend workflow + source-verified** context when it cannot browse the full repo.  
**Repo root:** `/Users/cybertruck/DevProjects/2026/Acentria/Acensure-Front`  
**Sibling API:** `/Users/cybertruck/DevProjects/2026/Acentria/AcensureMainApi`  
**API companions:** `AcensureMainApi/public/guide/AGENT_HANDOFF.md`, `public/claude-summary-01.md`, `public/guide/SYSTEM_OVERVIEW.md`

---

## 0. Agent instructions (Front-specific)

Follow these before changing UI or API calls.

### Hard rules

- Match the **local style** of the area you edit (admin CRUD vs customer stepper vs payment). Do not invent a new architecture inside an existing feature.
- Do **not** commit / push / amend unless the owner asks.
- Do **not** start a large refactor without a stepwise plan the owner approved.
- Prefer **DRY** and reuse existing hooks/components (`src/dev/*`, `src/components/ui/*`, `src/hooks/*`).
- Owner is strong in **JS/PHP**, newer to **React/TS** — keep code readable; short comments OK when a React pattern is non-obvious.
- For non-Laravel concepts (React Router, TanStack Query, Zustand), point at **real docs** when explaining.
- Use **Tailwind v4** (already in project via `@tailwindcss/vite`). Do not downgrade patterns or introduce random design systems.
- Preserve admin **RBAC gating** (`AdminModulePage`, `module` / `modules` / `permission` on nav). Module keys must match API catalog (`src/auth/module-keys.ts`).
- Do **not** silently point Travel/Marine at Motor purchase/payment endpoints as if they were E2E finished.
- Tests: `npm test` / `yarn test` → **Vitest** (`vitest run`). Prefer targeted tests when adding logic.

### Safe change pattern

1. Read sibling page/modal/column in the same feature folder  
2. Reuse `UseApiQuery` / `UseApiMutation`, dialog factory, table columns under `src/dev/columns/**`  
3. Wire routes in `src/App.tsx` + constants in `src/utils/enums.ts` if needed  
4. Gate admin pages with `AdminModulePage` / correct `MODULES.*`  
5. Run Vitest for touched logic; smoke the flow manually if payment/auth  

### Pair with API

- Front talks to API `/api/v1` via Axios (`src/lib/api-client.ts`)
- Prefer **PATCH** for resource updates (API convention)
- Org context: `X-Organization-Location-Id` + `X-Location-Code`
- Credit spend is **server-side** (`MotorCreditGate`); Front pays invoice via credit endpoints — see credit section below

---

## 1. Stack and versions (from `package.json`)

| Layer | Choice |
| --- | --- |
| UI | React `^19.2`, TypeScript `~5.9` |
| Bundler | Vite `^7.2` (dev: `vite --host`, port **5176**) |
| Routing | `react-router-dom` `^7` — `createBrowserRouter` in `src/App.tsx` |
| Server state | TanStack React Query `^5` |
| Client state | Zustand (`auth-store`, `stepper-store`, `theme-store`, `session-timeout-store`) |
| Forms | `react-hook-form` + Zod `^4` |
| UI kit | shadcn-style + Radix + Tailwind CSS `^4` |
| HTTP | Axios (`src/lib/api-client.ts`); also `ofetch` present |
| Tables | `@tanstack/react-table` |
| Tests | Vitest `^4` + Testing Library + jsdom |
| Deploy | Docker + nginx (`Dockerfile`, `nginx.conf`) |

**Scripts:**

```bash
npm run dev      # vite --host (port 5176)
npm run build
npm run lint
npm test         # vitest run
npm run test:watch
```

**Alias:** `@/*` → `src/*` (`vite.config.ts`).

**Allowed hosts (dev):** `acensure.test`, `acentria.localhost`, `lolc-kenya.acensure.test`.

---

## 2. How Front talks to the API

### Base URL (`src/lib/api-client.ts`)

```ts
const API_BASE_URL = import.meta.env.VITE_DEBUG === 'true'
  ? import.meta.env.VITE_LOCAL_URL
  : 'https://sandbox.acensure.acentriagroup.com/api/v1/'
```

Typical local: `VITE_DEBUG=true` and `VITE_LOCAL_URL=http://localhost:8002/api/v1/` (or Sail/nginx equivalent).

Also used in places: `VITE_BASE_URL` (profile / org location UI).

### Auth + headers

| Mechanism | Detail |
| --- | --- |
| Token storage | `localStorage` key **`auth-storage`** (`AUTH_STORAGE_KEY`) — JWT + abilities + org location |
| Request | `Authorization: Bearer <token>` (skipped for `auth/login` and `auth/org`) |
| Org scope | `X-Organization-Location-Id` unless bypass user (`is_general` or `super_admin`) |
| Country | `X-Location-Code` from `request-context-headers` (`locationCode` in localStorage) |
| 401 | Emits session-expired (unless login/logout/refresh / already on auth page / stale token) |

Constants: `src/auth/constants.ts`.  
Permission helpers: `src/auth/can.ts` (`can`, `canModuleAction`, `canModuleMenu`, `isBypassUser`).  
Hooks: `useCan`, `useAbilities`, `useModules`.

### Tenant / subdomain guests

- `src/lib/tenant-from-host.ts` — tenant subdomains vs root host  
- `src/auth/subdomain-guest-gate.tsx` — wraps guest flows on org subdomains  
- Examples: `lolc-kenya.acensure.test`, `acentria.localhost`

---

## 3. Project map (where code lives)

| Path | Role |
| --- | --- |
| `src/App.tsx` | All routes (`createBrowserRouter`) — large; search by path |
| `src/main.tsx` | App bootstrap |
| `src/Layout.tsx` | Shell |
| `src/app/landing/` | Marketing / product list |
| `src/app/customer/motor\|travel\|marine/` | Customer quote wizards |
| `src/app/customer/profile-settings/` | Customer profile |
| `src/app/payment/` | Gateway return/success/failed (mpesa, paystack, credit) |
| `src/app/admin/` | Broker dashboard features |
| `src/app/dashboard.tsx` | Admin home |
| `src/auth/` | Login, JWT, RBAC UI gates, subdomain |
| `src/navigation/admin-nav-config.ts` | Sidebar items + module filters |
| `src/lib/` | API client, tenant, formatters, motor premium params |
| `src/stores/` | Zustand |
| `src/hooks/` | Route guards, payment flows, purchase stepper |
| `src/components/ui/` | Primitives (shadcn) |
| `src/components/shared/` | Shared composites |
| `src/dev/` | Feature “framework”: tables, columns, steppers, inputs |
| `src/utils/enums.ts` | `EPREFIX`, `EROUTES` path constants |
| `src/utils/constatnts.ts` | Session storage keys, misc (**filename spelling is intentional in repo**) |
| `src/utils/steps-config.ts` | Motor / Travel / Marine step lists |
| `src/data/` | Dummy data for unfinished areas |
| `.guide/` | Credit + developer flow docs (local, not public/) |

---

## 4. Routing overview (from `EROUTES` + `App.tsx`)

### Public / customer

| URL | Feature |
| --- | --- |
| `/` | Landing |
| `/products`, `/contact-us` | Catalog / contact |
| `/customer/motor/...` | Motor wizard |
| `/customer/travel/...` | Travel wizard |
| `/customer/marine/...` | Marine shell |
| `/customer/profile/...` | Covers, claims, settings |
| `/auth/signin|signup|…` | Auth |
| `/payment/mpesa|paystack|credit/...` | Payment returns |
| `/dashboard/payment/...` | Same payment pages inside admin layout |

### Admin (`/dashboard/...`) — live-ish areas

| Area | Path prefix | Gate modules (examples) |
| --- | --- | --- |
| Motor quotations | `/dashboard/quotations/motor-quotations` | `quotation-motor`, `quotation-motor-alternative` |
| Motor products/rates | `/dashboard/products/motor*` | `product-motor` |
| Travel products | `/dashboard/products/travel*` | Travel admin (some still “coming soon”) |
| Credit | `/dashboard/credit/*` | `finance-control` (+ `.mine` for agent wallet) |
| Motor certificates | `/dashboard/motor-certificates` | `dmvic-certificate` |
| DMVIC stock | `/dashboard/dmvic-stock` | `dmvic-stock` |
| Finance | `/dashboard/finance/*` | `finance-module` / report modules |
| Currencies | `/dashboard/currencies/*` | `atu-multicurrency-*` |
| Orgs / roles / users | `/dashboard/organizations…`, roles, users | org / rbac modules |

### Legacy / stub (often dummy data)

Routes still exist for SACCO-style shells: `members`, `savings`, `loans`, `transactions`, `staff` — largely **not** the live insurance product path. Prefer Motor/Travel/Credit/DMVIC when doing real work.

Guards: `ProtectedRoute`, `PublicRoute`, `CustomerPublicRoute` (`src/hooks/hooks.tsx`); admin pages wrap `AdminModulePage`.

---

## 5. Customer wizards (steppers)

Defined in `src/utils/steps-config.ts`.

### Motor (`getMotorSteps`) — **live E2E**

Guest steps: verification → OTP → vehicle → quotations → KYC → invoice → payment → success.  
Authenticated users **skip** verification/OTP (`slice(2)`).

Session keys (`src/utils/constatnts.ts`):

| Key | Constant |
| --- | --- |
| `motor_quote_session_id` | `MOTOR_QUOTE_SESSION_STORAGE_KEY` |
| `purchase_session_id` | `PURCHASE_SESSION_STORAGE_KEY` |
| `invoice_purchase_session_id` | `INVOICE_SESSION_STORAGE_KEY` |

Typical API calls (relative to `/api/v1`):

- Premium: `quotation/motor/{session}/premium`
- Purchase start: `purchase/motor/{session}`
- KYC (alternative path heavily used): `alternative/purchase/motor/{session}/kyc`
- Documents: `document/motor/...`

Payment tabs: M-Pesa, card/Paystack, cash, **credit** (`src/app/customer/motor/steppers/payment-tabs/`).

### Travel (`getTravelSteps`) — **UI shell / in progress**

Same shape as Motor (verify → OTP → traveller → quotes → KYC → invoices → payment → success).  
Do **not** assume every step hits real Travel APIs; verify URLs before treating as production. Admin Travel product pages may still show “Coming soon”.

### Marine (`EMARINESTEPS`) — **shell**

Import/export tabs; still tends to reuse Motor-ish KYC/invoice/payment components — **not** production-safe as Marine insurance.

---

## 6. Admin RBAC (Front)

Module keys: `src/auth/module-keys.ts` — must stay aligned with API `config/rbac-modules-catalog.php`.

Important constants:

```text
quotation-motor | quotation-motor-alternative | quotation-travel
purchase-motor | purchase-motor-alternative-kyc
product-motor
finance-control
dmvic-certificate | dmvic-stock
report-motor-quotation | report-motor-invoice | report-motor-receipt | report-motor-cover
atu-multicurrency-currency | -log | -settings
```

`QUOTATION_MOTOR_MODULES` / `PURCHASE_MOTOR_MODULES` unlock the same UIs for standard **or** alternative API permission sets.

Sidebar filtering: `src/navigation/admin-nav-config.ts` (`module`, `modules`, `permission` on items).

Bypass: `is_general` **or** role `super_admin` → all UI permissions allowed (mirrors API middleware).

---

## 7. Credit UI (from `.guide/credit-system-frontend-react-v2.md` + code)

**Backend:** `/api/v1/credit/*` (setup / workflow / governance). Spending on Motor invoices is **server-side**; Front does not call a raw “spend” endpoint.

### Screens under `src/app/admin/credit/`

| Screen | Route (approx) | Notes |
| --- | --- | --- |
| Wallet | `/dashboard/credit/wallet` | Agent: `GET credit/wallet/mine` — need `finance-control.mine` |
| My / all transactions | `/dashboard/credit/transactions` | |
| Approvals | `/dashboard/credit/approvals` | Finance/manager |
| Pending schedules | `/dashboard/credit/pending` | Cover start / proceed |
| Setup pool / users | `/dashboard/credit/setup/pool\|users` | Allocate, pool settings |
| Settlements detail | `/dashboard/credit/settlements/:id` | |
| Adjustments | `/dashboard/credit/adjustments` | |

Shared: `credit-query.ts`, `credit-payment.ts`, components like `CreditAmount`, `CreditBalanceCard`.

### Payment return pages

Public + admin mirrors:

- `/payment/credit/{return,success,pending,failed}`
- `/dashboard/payment/credit/...`

### v2 API gotchas (vs outdated v1 guide)

| Topic | Current |
| --- | --- |
| Wallet | `GET /credit/wallet/mine` |
| Agent permission | `finance-control.mine` |
| Settlement body | `{ items: [{ credit_transaction_id, amount }], payment_gateway, phone?, email? }` |
| Settlement create | Creates settlement **and** starts payment → `{ settlement, payment }` |
| M-Pesa | `phone` required |
| Pesapal | `phone` **or** `email`; may return `redirect_url` |

Guides in repo: `.guide/credit-system-frontend-react-v2.md` (prefer), `.guide/credit-system-design.md`.

---

## 8. DMVIC / certificates (Front)

| Feature | Path |
| --- | --- |
| Motor certificates admin | `src/app/admin/motor-certificates/` — list/tabs, cancel modal, columns |
| DMVIC stock | `src/app/admin/dmvic-stock/` — list + `[id]` detail, create/edit modals |

API (relative): `/dmvic/motor/certificates…`, `/dmvic/stocks…` (see API `claude-summary-01.md`).

Recent work includes certificate **cancellation** UI — treat carefully; pair with API `MotorCertificateCancellationService`.

---

## 9. Feature build conventions (from `.guide/developer-guide-flow-cursor.md`)

### Admin CRUD page pattern

1. Page orchestrates filters (`useReducer` / `ReusableReducer`), `UseApiQuery`, `UseApiMutation`, dialog context  
2. `PageHeader` + `CustomBaseTable` + `CustomDialogComponent`  
3. Columns in `src/dev/columns/**`  
4. Modals: `react-hook-form` + `zodResolver`, single mutation, toast, refetch via `componentProps?.refetch`

### Naming quirks (match existing)

- Many hooks are **PascalCase**: `UseApiQuery`, `UseApiMutation`, `UseAuth`  
- Mutations: `submitMutation`, `deleteUserMutation`, …  
- Dialog: `handleDialogContextSwitch`, `dialogContent`

### Steppers

- One component per step; tabs as nested `tabs/`  
- Shell owns navigation + submission  

Do not fight local style — copy the nearest sibling feature.

---

## 10. Product status (Front view)

| Product | Customer | Admin | End-to-end? |
| --- | --- | --- | --- |
| **Motor** | Full wizard + real APIs + payments (incl. credit) | Products, quotes, reports, certificates | **Yes** |
| **Travel** | Stepper UI; verify API wiring per step | Product pages (some coming soon) | **No** (in progress) |
| **Marine** | Shell / stubs | — | **No** |
| **Medical / Life** | Landing placeholders | — | **No** |

Credit is a **payment method for Motor**, not a separate insurance line.

---

## 11. Related docs in this repo

| File | Topic |
| --- | --- |
| `.guide/developer-guide-flow-cursor.md` | How to build features in this codebase |
| `.guide/developer-guide-flow-codex.md` | Same family, Codex-oriented |
| `.guide/credit-system-frontend-react-v2.md` | **Current** credit Front guide |
| `.guide/credit-system-frontend-react.md` | Outdated v1 — prefer v2 |
| `.guide/credit-system-design.md` | Credit domain design |
| `.guide/rbac-implementation/`, `.guide/rbac-plans-react/` | RBAC Front plans |
| `README.md` | Default Vite README (thin) |

API-side deep dives live under `AcensureMainApi/public/guide/`.

---

## 12. Quick “do not” list (Front)

- Do not commit without asking  
- Do not break Motor payment return URLs or sessionStorage keys without a migration plan  
- Do not drop `AdminModulePage` / nav module gates  
- Do not hardcode API host; use env (`VITE_DEBUG` / `VITE_LOCAL_URL`)  
- Do not treat Travel/Marine payment as production Motor clones  
- Do not introduce Inter/purple-gradient generic AI landing redesigns on branded pages unless asked  
- Do not add `"version"` games in unrelated PHP packages (API concern; listed for cross-repo agents)

---

## 13. What this pack does not replace

- Full component source / every route child in `App.tsx`  
- Live `.env` values  
- Uncommitted WIP on branches  

For code edits without repo access: ask the owner to paste files or run Vitest/build and share output. Prefer working inside this clone.

---

*claude-summary-01 (Front) — offline pack for agents. Update when routing, credit, or Motor/Travel E2E status changes materially.*
