paybillswithus.com — Product & Engineering README (v1)

Goal: build a modern, light-theme website where any U.S. user can discover providers for Internet, Home, TV, Electric, Mobile, call your team to enroll, and—after sign-up—use a secure portal to view/update their info and saved payment methods.
Discounts: 25% off every month (applied by your agents; no online payments required to enroll).
Stack: Vite + React (TS), Tailwind, Node.js + Express (JWT auth), PostgreSQL (or MySQL). No Firebase. Hosting on your GoDaddy VPS under paybillswithus.com.

0) High-level Requirements

Public site (no auth): category tabs, ZIP search → major providers list per category; “Call us” CTA everywhere.

Auth flows: register, login, forgot/reset password.
Registration fields: email, name, password, re-password, last4 SSN, DOB, address.
Reset password: email + address + last4 SSN as verification step.

On first successful registration: generate unique Customer Number (e.g., CUS-2025-000123).

User portal (after auth):

Manage profile, add multiple cards, add bank (routing/account) for manual checking.

Users cannot self-add billers; agents add billers/bills/receipts after phone verification.

Clear “Call us to get 25% discount” and permissions notice (“allow us to handle all bills”).

Agent portal (auth, separate role):

Lookup by Customer Number.

Add/update billers on the account; add bills, mark discount applied; upload/view receipts.

View read-only masked payment info.

Admin panel (locked down subdomain):

Manage agents, roles, providers catalogs, global settings, audit logs; view high-level stats.

1) UX & Navigation
Public (no login)

Home (hero: “Get 25% OFF every month — Call now”)

Categories: Internet | Home | TV | Electric | Mobile

ZIP search → show providers in that ZIP (fallback to 7–9 major providers if none specified)

Provider details (logo, plans, highlights, “Call Toll-Free” button)

CTA sections repeated (sticky footer button on mobile)

Links: FAQ, Privacy, Terms, Contact

Auth

Register

Login

Forgot / Reset Password

User portal (role: user)

Dashboard (Customer Number, savings message)

My Profile (name, DOB, address)

Payment Methods

Cards (tokenized; store only brand/last4/expiry)

Bank (routing/account — tokenized if possible; if not, store encrypted and masked)

My Billers (read-only list set by agent)

Bills & Receipts (read-only; downloadable receipts)

Help / Call Us

Agent portal (role: agent)

Customer Search (by email, phone, Customer Number)

Customer Overview (profile, masked payment methods)

Manage Billers (attach/remove billers to customer)

Add Bill (period, amounts, 25% discount flag, notes)

Upload Receipt (PDF/JPG)

Audit trail (what changed, when, by whom)

Admin panel (role: admin)

Dashboard (counts: users, agents, active customers, bills this month)

Users (list/ban/promote, reset)

Agents (create agent accounts, set permissions)

Providers Catalog (per category; 7–9 default marquee providers)

Global Settings (toll-free number, banners, discount % default = 25)

Audit Logs (downloadable CSV)

System Health (jobs, queue status)

2) Visual & Theme

Light theme, modern, friendly.

Tailwind palette: blue primary (#2563EB), amber accent (#F59E0B), gray surface (#F8FAFC).

Accessibility: 4.5:1 contrast, focus states, keyboard nav.

3) Security & Compliance (must-haves)

Absolutely do not store raw PAN (full card numbers) or plaintext bank info in DB.

Use a PCI-compliant vault / tokenization provider (Stripe, Braintree, Adyen) for vaulting only, even if you don’t charge online today. Store only token, brand, last4, exp_month/year.

For bank (routing/account), prefer Nacha-compliant tokenization. If you must store, encrypt with AES-256-GCM using a KMS-managed key; only store masked values in app.

Hash passwords with Argon2id (or bcrypt cost ≥ 12).

JWT short-lived (15m) + refresh tokens (httpOnly, secure cookies).

Rate limiting, IP allowlists for admin, WAF on Nginx, CSRF for state-changing non-JWT flows.

PII minimization & audit logging.

At-rest encryption (DB volume + field-level for DOB, SSN last4, address).

Log access to sensitive fields.

4) Architecture
[ React (Vite, TS) SPA(s) ]  →  [ Nginx ]  →  [ Node.js (Express) API ]  →  [ PostgreSQL ]
                                                       │
                                                   [ Object Storage / PSP token vault ]


Frontends: three logical apps (can be one codebase with role-based routing):

/ Public + User portal

agent.paybillswithus.com Agent portal

admin.paybillswithus.com Admin panel (hardened)

API: Express + Zod validation + Prisma (or Knex) ORM + JWT auth

DB: PostgreSQL (recommended), one schema with strict RBAC

Background jobs: Node worker (BullMQ/Redis) for receipts processing, audit rollups

Hosting: GoDaddy VPS, Nginx reverse proxy, PM2 for Node

5) Data Model (PostgreSQL)

All *_enc fields are encrypted at application layer (AES-256-GCM).
All tokens from a PSP vault are safe to store as opaque strings.

users

id (uuid, pk)

email (unique), name

password_hash

dob_enc, address_enc

ssn_last4_enc

customer_number (unique, e.g., CUS-YYYY-######)

role ENUM(user,agent,admin)

created_at, updated_at, last_login_at, status ENUM(active,suspended)

auth_refresh_tokens

id (uuid), user_id (fk), token_hash, expires_at, created_at, revoked_at

providers

id (uuid), slug (unique), name, category ENUM(internet,home,tv,electric,mobile)

logo_url, is_featured (bool), active (bool)

created_at, updated_at

provider_plans

id (uuid), provider_id (fk), name, price_cents, features (jsonb), discount_eligible (bool)

customer_billers

id (uuid), user_id (fk), provider_id (fk), plan_id (fk)

status ENUM(active,paused,removed)

notes, created_by (agent id), created_at, updated_at

bills

id (uuid), user_id (fk), provider_id (fk), period (YYYY-MM)

amount_before_cents, discount_percent (default 25), amount_after_cents

status ENUM(recorded,paid,failed,refunded)

created_by (agent id), created_at

receipts

id (uuid), bill_id (fk), user_id (fk)

file_url, file_name, mime_type, size_bytes

uploaded_by (agent/admin), uploaded_at

payment_methods

id (uuid), user_id (fk), type ENUM(card,bank)

For card: vault_token, brand, last4, exp_month, exp_year

For bank: vault_token or routing_last4, account_last4, holder_name_enc

is_default (bool), created_at

agents

id (uuid, fk users), employee_code (unique), active (bool)

audit_logs

id (uuid), actor_id (user/agent/admin), action, target_type, target_id, diff (jsonb), ip, ua, created_at

settings

key (pk), value (jsonb)
(e.g., {"tollFree":"+1-800-555-9999","globalDiscount":25})

6) API (Express) — endpoints & contracts (summary)

All request/response bodies validated with Zod.
Auth: JWT in Authorization: Bearer <token>.

Auth

POST /api/auth/register

In: { email, name, password, confirmPassword, ssnLast4, dob, address }

Out: { user:{id,customerNumber,role}, accessToken, refreshToken }

POST /api/auth/login

In: { email, password }

Out: { user, accessToken, refreshToken }

POST /api/auth/refresh → new access token

POST /api/auth/forgot

In: { email, address, ssnLast4 } → send reset link/email token

POST /api/auth/reset

In: { token, newPassword, confirmPassword }

Public providers

GET /api/providers?category=&zip=

GET /api/providers/:slug

GET /api/providers/featured (7–9 defaults per category if zip missing)

User (role: user)

GET /api/me

PUT /api/me (update name, address, dob) — PII fields encrypted

GET /api/me/payment-methods

POST /api/me/payment-methods (tokenized)

DELETE /api/me/payment-methods/:id

GET /api/me/billers (read-only)

GET /api/me/bills (read-only)

GET /api/me/receipts (read-only)

Agent (role: agent)

GET /api/agent/customers?query= (email/phone/customerNumber)

GET /api/agent/customers/:id

POST /api/agent/customers/:id/billers (attach provider/plan)

DELETE /api/agent/customers/:id/billers/:cid

POST /api/agent/customers/:id/bills

POST /api/agent/customers/:id/bills/:billId/receipts (file upload)

GET /api/agent/audit?customerId=

Admin (role: admin) — on locked subdomain

GET /api/admin/overview

POST /api/admin/agents (create/disable)

GET /api/admin/agents

POST /api/admin/providers (CRUD providers & plans)

PUT /api/admin/providers/:id

DELETE /api/admin/providers/:id

GET /api/admin/audit?range=

7) Customer Number Generation

Format: CUS-<YEAR>-<6-digit zero-padded counter> (e.g., CUS-2025-000123)

Implementation:

Table counters with row customer_number

Transaction: read → increment → return new customerNumber

Assign on first successful registration

8) Error Handling & Responses

Standard shape:

{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Dob is invalid", "fields": { "dob": "Must be YYYY-MM-DD" } } }


Common codes: VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL

Log correlation id; return x-request-id header

Do not leak sensitive details; mask last4 only

9) Frontend Apps & Routing (keep portals separate)

Monorepo (recommended):

/apps
  /web        → public + user portal (Vite React TS)
  /agent      → agent portal (Vite React TS)
  /admin      → admin panel (Vite React TS)
/packages
  /ui         → shared Tailwind components
  /types      → shared TS types
  /config     → lint, tsconfig base
/server
  /src        → Express API, Prisma, Zod, JWT, upload handlers
  /migrations


Do not mix user/agent/admin routes in one UI unless strictly role-gated.

Shared UI elements in /packages/ui to keep consistency.

10) Nginx on GoDaddy VPS

Domains:

paybillswithus.com → /apps/web/dist

agent.paybillswithus.com → /apps/agent/dist

admin.paybillswithus.com → /apps/admin/dist (locked)

API api.paybillswithus.com → reverse proxy → Node (PM2 on port 8080)

Admin hardening

Restrict by IP allowlist (office/VPN ranges)

Additionally, enable HTTP Basic Auth on admin subdomain

Enforce HTTPS only (Let’s Encrypt)

11) Security Hardening Checklist

✅ Argon2id password hashing

✅ JWT (RS256) with rotating keys; access(15m) + refresh(30d)

✅ IP allowlist + BasicAuth for admin subdomain

✅ Helmet, CORS, rate limit, user-agent & geo risk checks

✅ Zod validation on all inputs

✅ Encrypt PII fields (DOB, SSN last4, address) with AES-256-GCM (key from env/KMS)

✅ Store only tokenized payment methods (or encrypt + mask if vault unavailable)

✅ Logging: redact sensitive fields; audit who did what

✅ Backups: nightly DB dumps; restore drills monthly

12) Provider Catalog (seed)

Keep 7–9 marquee providers per category as fallback (no ZIP).

Add coverage_by_zip table later for ZIP filters (or store coverage prefixes ranges).

13) Implementation Plan (you’ll open separate Codex chatlists per section)

Phase A — Foundations

Monorepo scaffolding + lint/prettier + husky

Tailwind design system & shared UI lib

Public web app pages & routes + mock data

Phase B — Auth & Users
4. Express API auth (register/login/refresh/forgot/reset)
5. Customer Number generator
6. User portal skeleton (profile, payment methods read-only)
7. Payment method tokenization adapter (PSP vault) — no charging

Phase C — Agents
8. Agent portal skeleton (search, overview)
9. Attach/remove billers, add bill entry, upload receipt
10. Audit logs

Phase D — Admin
11. Admin portal skeleton (agents/users/providers/settings)
12. Provider CRUD, seed marquee providers

Phase E — Hardening & Ship
13. Security checklist pass
14. Nginx configs + HTTPS
15. CI/CD scripts (build → upload → pm2 reload)
16. Monitoring & logging

14) Flow Diagrams (ASCII)
Registration & Customer Number
User → Web (Register Form)
     → API /auth/register (validate + hash + encrypt PII)
     → DB txn: create user + get next counter → customer_number
     ← JWT(access, refresh) + user profile(with customer_number)

Agent adds bill & receipt
Agent → Agent Portal (lookup customer)
      → API /agent/customers/:id/billers (attach provider/plan)
      → API /agent/customers/:id/bills (create bill with 25% discount)
      → API /agent/customers/:id/bills/:billId/receipts (upload)
      → Audit log records each step

15) Error Cases & Handling

Duplicate email on register → 409 CONFLICT

Wrong reset info (email + address + last4 mismatch) → 403 FORBIDDEN

Accessing other user’s data → 403 FORBIDDEN (log + alert)

Upload > allowed size/type → 400 VALIDATION_ERROR

Provider not active → 404 NOT_FOUND

Rate limit exceeded → 429 RATE_LIMITED

16) Open Questions (please confirm before coding)

PSP tokenization: Are we integrating a card/bank token vault (recommended) or encrypting ourselves temporarily?

ZIP coverage: Do you want a real coverage database now or seed with marquee providers first?

Password reset: Email link + verifying address + last4 SSN OK? (We’ll still send a secure token to email.)

Receipts storage: Local disk on VPS or S3-compatible storage? (S3 recommended.)

Admin IPs: Provide office/VPN IP ranges for allowlist.

Brand content: Final toll-free number, hero copy, and provider logos you prefer.

Database: PostgreSQL vs MySQL — any preference?

17) Outsourcing / Dependencies

PCI scope if you plan to ever charge online; today we avoid storing PAN and recommend a vault.

Legal pages (Terms/Privacy/Consent to handle bills) — consider legal review.

Logo usage permissions for provider brands (ensure compliant).

18) Acceptance Criteria (v1)

Public site responsive, fast, clear “Call us” CTAs, ZIP search with fallback providers

Auth flows working; customer number assigned

User portal shows profile + payment methods (add/edit) without exposing secrets

Agent portal can search by customer number and manage billers/bills/receipts

Admin panel reachable only via locked subdomain & IP allowlist

Full audit logs; PII encrypted; no raw card data stored
