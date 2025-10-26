# Roadmap — Next.js (TS) + S3 JSON Content + S3 Config (All AWS)

## Project Description

This is a **server-side rendering web application** serving as a professional portfolio and resume website. The project demonstrates full-stack software engineering capabilities through:

### Core Objectives
- **Professional Portfolio**: Showcase technical skills, projects, and experience
- **Public Demonstration**: Complete visibility of coding and solution design capabilities
- **Security-First**: All sensitive/secret data managed separately from public codebase
- **Scalable Architecture**: Reusable components and SDKs for broader ecosystem

### Multi-Repository Architecture
1. **Frontend Website** (this repo): Next.js portfolio using published packages
2. **Component Library**: Reusable React/Next.js/React Native components (npm package)
3. **TypeScript SDK**: Common functionalities for React ecosystem (npm package)
4. **Infrastructure**: Separate IaC repository for all AWS resources
5. **Documentation**: Dedicated repository for comprehensive project docs

### Technical Showcase
- **Solution Design**: End-to-end architecture planning and implementation
- **Full-Stack Development**: Frontend, backend, and infrastructure expertise
- **Package Management**: Publishing and consuming npm packages
- **TypeScript**: Type-safe development across all layers
- **AWS Integration**: S3, CloudFront, Lambda, Cognito, and security best practices

## 0) Architecture snapshot (target end-state)

* **Frontend runtime**: Next.js (TypeScript), SSR/ISR.
* **Backend runtime**: Next.js **route handlers/API** (server-only) reading/writing **S3 JSON**.
* **Storage**:

  * `s3://<app>-content-{env}` for **context** (content JSON + media).
  * `s3://<app>-config-{env}` for **configuration JSON** (environment-scoped).
* **Auth (later phase)**: Cognito (public visitor → creator → admin via groups/claims).
* **Delivery**: Route53 → CloudFront (ACM cert) → Lambda (OpenNext/SST) → S3.
* **Security**: S3 **Block Public Access**; **OAC** for static assets; server IAM role for read/write; SSE-KMS; least-privilege IAM.
* **IaC**: SST (recommended) or CDK; GitHub Actions CI/CD.
* **Environments**: `dev`, `stage`, `prod` (separate buckets, CloudFront, distributions, roles).

---

## 1) Program phases (1–7)


### [Phase 1 — Frontend with mock data](./phase1-frontend-mock-data.md)

**Goal:** Ship UI skeleton using mocked data + fixtures.

**Steps**

* Create repo and Next.js (TS) project; set up linting, formatting, testing (ESLint, Prettier, Vitest/Jest).
* Define **app structure** (`/app` or `/pages`), shared libs (`/src/lib`), design tokens, and routing.
* Build **component library (internal folder)**: buttons, inputs, layout grid, typography, table/list, modal, toast.
* Create **mock data**: JSON fixtures for public pages; place under `/mocks` and build a simple mock service in `/src/lib/mock`.
* Implement **UI features** with mock fetchers:

  * Home (public content)
  * Editor shell (hidden behind feature flag)
  * Admin shell (hidden behind feature flag)
* Add **Preview Mode** hooks (no auth yet) to simulate draft vs published content views.

**Deliverables**

* Running local app with mock content.
* Component library v0 within the app.
* UX flows for visitor, creator, admin (disabled/hidden until auth later).

**Acceptance**

* All main routes render with mock data.
* Lint/test pass, type-safe build.

---

### Phase 2 — Backend with mock data

**Goal:** Define API contracts and server handlers against mock stores.

**Steps**

* Create Next.js **route handlers** under `/app/api/...` (or `/pages/api/...`) returning mocks.
* Define **API contracts** (OpenAPI YAML or TypeScript types):

  * `GET /api/content/:slug` (published)
  * `GET /api/drafts/:slug` (creator/admin only; later)
  * `PUT /api/drafts/:slug` (save draft)
  * `POST /api/publish` (admin only)
  * `GET /api/config` (server-render use)
  * `PUT /api/config` (admin only)
* Implement a **mock repository** layer (`/src/server/repos/mock`) that simulates S3.
* Add **basic input validation** (Zod/Yup) + error envelopes.

**Deliverables**

* API routes backed by in-memory/mock files.
* Shared **DTOs/types** for requests/responses.

**Acceptance**

* API endpoints return deterministic mock data.
* Frontend can point to these endpoints locally.

---

### Phase 3 — Integrate backend & frontend

**Goal:** Wire SSR pages and client components to API routes.

**Steps**

* Replace mock fetchers with **real API calls** (still served by mock repo).
* Implement **SSR data fetching** (e.g., `generateMetadata`, `getServerSideProps` or server components).
* Gate **editor/admin UIs** behind a feature flag (still unauth).
* Add **loading**, **error**, **empty** states across pages.

**Deliverables**

* UI reads/writes via API layer (mock repo).
* End-to-end flow locally (edit draft → preview draft → “publish” simulation).

**Acceptance**

* All primary journeys work against API routes.
* Tests cover API adapters and UI states.

---

### Phase 4 — Infrastructure, server, and S3 setup

**Goal:** Stand up AWS resources (dev env) and connect to S3 (no auth yet).

**Steps**

* **S3 buckets** (dev):

  * `s3://<app>-content-dev` with versioning, SSE-KMS, BPA=ON.
  * `s3://<app>-config-dev` with versioning, SSE-KMS, BPA=ON.
  * **Suggested prefixes**:

    * Content: `published/{type}/{slug}.json`, `drafts/{type}/{slug}.json`, `media/{...}`
    * Config: `app/config.json`, `features.json`
* **Bucket policies**: allow only the **Lambda execution role**; block public.
* **CloudFront** + **OAC** for static assets; **ACM** cert (us-east-1).
* **Route53**: Dev subdomain `dev.<domain>` pointing to CloudFront.
* **App deployment runtime**: SST/OpenNext to package Next.js into Lambda + CloudFront.
* Add a **server repository implementation** for S3 (`/src/server/repos/s3`).

**Deliverables**

* Dev AWS infra up; app can read **published** JSON and **config** from S3.
* Write paths (drafts) functional via server IAM role.

**Acceptance**

* From local (or dev deploy), server can **GET/PUT** JSON in S3 with correct prefixes.
* CloudFront serves app over HTTPS at `dev.<domain>`.

---

### Phase 5 — Integrate backend into live infra (authz, roles, preview)

**Goal:** Lock down access patterns, add Cognito auth, role-based features.

**Steps**

* Add **Cognito User Pool** + Hosted UI; map **groups**: `creator`, `admin`.
* Server-side auth: verify JWT, extract roles; add **RBAC middleware**.
* **Authorization matrix**:

  * Visitor (unauth): `GET published/*`, `GET config`.
  * Creator: `GET/PUT drafts/*`, preview drafts, **no publish**, **no config write**.
  * Admin: creator rights + `POST /api/publish`, `PUT /api/config`, cache revalidate tools.
* **Preview Mode**: allow creators/admins to preview **draft** content.
* **Publishing flow** (server-side): copy draft → published prefix atomically; optionally write an **audit log** entry to `logs/audit/yyyymmdd.jsonl`.

**Deliverables**

* Authenticated flows working on `dev.<domain>`.
* RBAC enforced server-side; no client-side trust.

**Acceptance**

* Unauth users cannot access drafts or admin endpoints.
* Creator can edit drafts and preview; Admin can publish and update config.

---

### Phase 6 — Deployment (stage and prod go-live)

**Goal:** Promote to `stage` and `prod`.

**Steps**

* Replicate infra for `stage` and `prod` (separate stacks): buckets, KMS, CloudFront, Route53 records.
* Create **content bootstrap** (seed published JSON).
* Configure **ISR** (revalidation intervals) and **admin revalidate actions**.
* Set **monitoring & alarms**: 5xx rates, Lambda errors, S3 access denied, publish failures.

**Deliverables**

* `stage.<domain>` and `<domain>` live behind CloudFront with TLS.
* Documentation for content editors & admins (publish, rollback, revalidate).

**Acceptance**

* Smoke tests pass on stage → prod.
* Runtimes scale; latency within target; errors alarm correctly.

---

### Phase 7 — IaC + CI/CD (automated)

**Goal:** Everything declarative; single-command deploys per env.

**Steps**

* **IaC** with **SST** (or CDK):

  * Stacks for `dev`, `stage`, `prod` (buckets, CloudFront, OAC, ACM, Cognito, roles).
* **GitHub Actions**:

  * CI: typecheck, lint, unit/integration tests.
  * CD: on `main` → deploy `dev`; on release/tag → deploy `stage`; manual approval → `prod`.
* **Component library packaging**: split to `/packages/ui` with `tsup`/`rollup`, publish to GitHub Packages or npm; app consumes versioned package.
* **Content migrations**: simple script to validate/transform JSON (Zod + CLI).

**Deliverables**

* Pipelines green; one-click promote to prod.
* Versioned UI package used by the app.

**Acceptance**

* Infra changes via PR only; deployments automated and reproducible.

---

## 2) Workstreams (deeper detail)

### A) Frontend Workstream

**Structure**

```
/app (or /pages)
/src
  /components      (UI lib v0)
  /features        (domain modules)
  /lib             (utils, fetchers)
  /server          (only server code & repos)
  /styles          (design tokens, globals)
  /types           (DTOs, API contracts)
  /mocks           (fixtures)
```

**Component Library Plan**

* v0: In-repo folder with composable primitives.
* v1: Extract to `/packages/ui`, add build pipeline, semantic versioning, storybook (optional).

**UI Features (initial)**

* Public homepage (published content).
* Content listing/detail.
* Editor UI (draft editor, preview, save).
* Admin console (publish, config edit, invalidate cache).

**Mock Data**

* `mocks/content/published/*.json`, `mocks/content/drafts/*.json`, `mocks/config/config.json`.
* Provide typed factories for predictable tests.

**DoD**

* Type-safe props; accessibility checks; loading/error states; SSR friendly.

---

### B) Backend Workstream

**API Contracts (TS types)**

* `GET /api/content/:slug` → `{ slug, data, version, updatedAt }`
* `GET /api/drafts/:slug` (auth: creator/admin)
* `PUT /api/drafts/:slug` (auth: creator/admin) → `{ ok: true, version }`
* `POST /api/publish` (auth: admin) → `{ ok: true, publishedPaths: [...] }`
* `GET /api/config` → `{ features, settings }`
* `PUT /api/config` (auth: admin) → `{ ok: true }`
* `POST /api/revalidate` (auth: admin) → `{ ok: true }`

**Repository Layer**

* `MockRepository` (phase 2–3).
* `S3Repository` (phase 4+):

  * `getPublished(slug)`, `getDraft(slug)`, `putDraft(slug, json)`, `publish(slug)`, `list(type)`.
  * `getConfig()`, `putConfig(json)`.
  * Uses `If-Match`/etag style optimistic concurrency (store and verify a `version`).

**Validation**

* Zod schemas per content type + config.
* Reject writes failing schema; return structured errors.

**RBAC**

* Middleware verifying JWT & roles (`visitor | creator | admin`).
* Server-only checks—never trust client.

---

### C) Data & S3 Layout

**Buckets**

* Content: `s3://<app>-content-{env}`
* Config: `s3://<app>-config-{env}`

**Prefixes**

```
content/
  published/<type>/<slug>.json
  drafts/<type>/<slug>.json
  media/<type>/<slug>/<file>
config/
  app/config.json
  app/features.json
logs/
  audit/YYYY/MM/DD.jsonl
```

**Versioning & Rollback**

* Enable S3 Versioning.
* Simple admin UI to restore a prior version (S3 `versionId`).

---

### D) Security & Compliance

* S3: **Block Public Access**; bucket policy grants to **Lambda role** only.
* Static asset bucket(s) behind **CloudFront OAC**.
* SSE-KMS on both buckets; KMS key with least-privilege grants.
* CloudFront + ACM TLS; force HTTPS; basic **WAF** rules.
* No CORS needed if single origin; otherwise restrict origins/methods/headers.
* CSRF tokens on mutating endpoints.
* Rate limiting on edit/publish endpoints (WAF or app-level).
* Audit log writes for every change (who/what/when/hash).

---

### E) Observability

* CloudWatch metrics + alarms: 5xx rate, Lambda errors, throttle, duration.
* Access logs: CloudFront & S3 to a logs bucket.
* Optional X-Ray for tracing.
* Health endpoint: `GET /api/health` (no secrets).

---

### F) CI/CD & IaC

**IaC (SST)**

* Stacks: `AppSite` (NextjsSite), `Buckets` (content/config), `Auth` (Cognito), `Network` (if needed), `Monitoring`.
* Outputs: distribution domains, bucket names, roles.

**GitHub Actions**

* `ci.yml`: install → typecheck → lint → test.
* `deploy-dev.yml`: on push to `main` → `sst deploy dev`.
* `deploy-stage.yml`: on release → `sst deploy stage`.
* `deploy-prod.yml`: manual approval → `sst deploy prod`.

---

## 3) Definitions of Done (per phase)

* **P1**: UI renders with mocks; routes stable; tests passing.
* **P2**: API routes return mocks; contracts documented; validation in place.
* **P3**: UI uses API; edit/preview/publish simulated end-to-end.
* **P4**: AWS dev infra up; S3 repo functional; HTTPS via CloudFront.
* **P5**: AuthN/Z live; RBAC enforced; preview & publish against S3.
* **P6**: Stage + prod live; monitoring and runbooks ready.
* **P7**: IaC complete; CI/CD green; UI library published & consumed.

---

## 4) Open questions (to finalize next)

1. Preferred **content types** & example JSON schemas (so we can codify Zod + DTOs).
2. Naming scheme for buckets, KMS keys, and Route53 records.
3. Whether you want **Remix-style forms** in editor (simplifies some SSR workflows) or stick with Next.js fetch patterns.
4. Choice of **SST vs CDK** (SST recommended for Next.js).