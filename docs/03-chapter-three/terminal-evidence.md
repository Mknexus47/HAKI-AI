# HAKI AI — Terminal & API Evidence (Appendix A, DSE 315 M3/M6)

Captured 2026-10-29 on Windows + Node 20, from repo root (`haki-ai/`). These are the pasted outputs required by `docs/04-chapter-four/appendix-checklist.md` (print this file into Appendix A).

## A.1 `npm run typecheck` — PASS (clean)

```text
> next-app@0.0.1 typecheck
> tsc --noEmit
```

Exit code 0, no errors.

## A.2 `npm run lint` — PASS (0 errors, 0 warnings)

```text
> next-app@0.0.1 lint
> eslint
```

Exit code 0, no output (ESLint prints nothing when clean). ESLint pinned to v9 per commit `376132d`.

## A.3 `npm run test:grounding` — ALL PASS

```text
> next-app@0.0.1 test:grounding
> npx -y tsx scripts/test-grounding.ts

PASS  demand-letter: retrieval sufficient
PASS  demand-letter: citation validation passes
PASS  demand-letter: references resolve to retrieved evidence
PASS  demand-letter: Constitution not cited by default
PASS  demand-letter: evidence emp-s35-service-pay has keyword overlap (semantic-only never cited)
PASS  demand-letter: evidence emp-s35-service-pay exists in repository
PASS  rent-acknowledgement: retrieval sufficient
PASS  rent-acknowledgement: citation validation passes
PASS  rent-acknowledgement: references resolve to retrieved evidence
PASS  rent-acknowledgement: Constitution not cited by default
PASS  rent-acknowledgement: evidence rr-scope has keyword overlap (semantic-only never cited)
PASS  rent-acknowledgement: evidence rr-scope exists in repository
PASS  service-agreement: retrieval sufficient
PASS  service-agreement: citation validation passes
PASS  service-agreement: references resolve to retrieved evidence
PASS  service-agreement: Constitution not cited by default
PASS  service-agreement: evidence loc-s1-title has keyword overlap (semantic-only never cited)
PASS  service-agreement: evidence loc-s1-title exists in repository
PASS  service-agreement: evidence loc-s2-english-law has keyword overlap (semantic-only never cited)
PASS  service-agreement: evidence loc-s2-english-law exists in repository
PASS  loan-acknowledgement: retrieval sufficient
PASS  loan-acknowledgement: citation validation passes
PASS  loan-acknowledgement: references resolve to retrieved evidence
PASS  loan-acknowledgement: Constitution not cited by default
PASS  loan-acknowledgement: evidence loc-s1-title has keyword overlap (semantic-only never cited)
PASS  loan-acknowledgement: evidence loc-s1-title exists in repository
PASS  loan-acknowledgement: evidence loc-s2-english-law has keyword overlap (semantic-only never cited)
PASS  loan-acknowledgement: evidence loc-s2-english-law exists in repository
PASS  complaint-letter: retrieval sufficient
PASS  complaint-letter: citation validation passes
PASS  complaint-letter: references resolve to retrieved evidence
PASS  complaint-letter: Constitution not cited by default
PASS  complaint-letter: evidence cpa-s3-purposes has keyword overlap (semantic-only never cited)
PASS  complaint-letter: evidence cpa-s3-purposes exists in repository
PASS  complaint-letter: evidence cpa-quality has keyword overlap (semantic-only never cited)
PASS  complaint-letter: evidence cpa-quality exists in repository
PASS  refund-letter: retrieval sufficient
PASS  refund-letter: citation validation passes
PASS  refund-letter: references resolve to retrieved evidence
PASS  refund-letter: Constitution not cited by default
PASS  refund-letter: evidence cpa-s3-purposes has keyword overlap (semantic-only never cited)
PASS  refund-letter: evidence cpa-s3-purposes exists in repository
PASS  refund-letter: evidence cpa-quality has keyword overlap (semantic-only never cited)
PASS  refund-letter: evidence cpa-quality exists in repository
PASS  tenancy-agreement: retrieval sufficient
PASS  tenancy-agreement: citation validation passes
PASS  tenancy-agreement: references resolve to retrieved evidence
PASS  tenancy-agreement: Constitution not cited by default
PASS  tenancy-agreement: evidence loc-s1-title has keyword overlap (semantic-only never cited)
PASS  tenancy-agreement: evidence loc-s1-title exists in repository
PASS  tenancy-agreement: evidence loc-s2-english-law has keyword overlap (semantic-only never cited)
PASS  tenancy-agreement: evidence loc-s2-english-law exists in repository
PASS  tenancy-agreement: evidence rr-scope has keyword overlap (semantic-only never cited)
PASS  tenancy-agreement: evidence rr-scope exists in repository
PASS  employment-contract: retrieval sufficient
PASS  employment-contract: citation validation passes
PASS  employment-contract: references resolve to retrieved evidence
PASS  employment-contract: Constitution not cited by default
PASS  employment-contract: evidence loc-s1-title has keyword overlap (semantic-only never cited)
PASS  employment-contract: evidence loc-s1-title exists in repository
PASS  employment-contract: evidence emp-s28-leave has keyword overlap (semantic-only never cited)
PASS  employment-contract: evidence emp-s28-leave exists in repository
PASS  employment-contract: evidence emp-s27-hours has keyword overlap (semantic-only never cited)
PASS  employment-contract: evidence emp-s27-hours exists in repository
PASS  affidavit: retrieval sufficient
PASS  affidavit: citation validation passes
PASS  affidavit: references resolve to retrieved evidence
PASS  affidavit: Constitution not cited by default
PASS  affidavit: evidence oaths-s2-commissioners has keyword overlap (semantic-only never cited)
PASS  affidavit: evidence oaths-s2-commissioners exists in repository
PASS  salary-claim: retrieval sufficient
PASS  salary-claim: citation validation passes
PASS  salary-claim: references resolve to retrieved evidence
PASS  salary-claim: Constitution not cited by default
PASS  salary-claim: evidence emp-s41-termination has keyword overlap (semantic-only never cited)
PASS  salary-claim: evidence emp-s41-termination exists in repository
PASS  salary-claim: evidence emp-s19-20-payment has keyword overlap (semantic-only never cited)
PASS  salary-claim: evidence emp-s19-20-payment exists in repository
PASS  salary-claim: evidence emp-s49-remedies has keyword overlap (semantic-only never cited)
PASS  salary-claim: evidence emp-s49-remedies exists in repository
PASS  fabricated Section 99 rejected
PASS  fabricated findings name the inventions
PASS  invented case law rejected
PASS  insufficient evidence detected
PASS  limitation notice disclosed
PASS  no authorities cited when evidence insufficient
PASS  insufficient-evidence output still validates
PASS  missing fields flagged
PASS  missing-info section rendered
PASS  docx has ZIP magic
PASS  docx contains document.xml
PASS  docx contains content types
PASS  docx has end-of-central-directory
PASS  old sources flagged stale
PASS  current repository not stale
PASS  retrieval deterministic

All grounding tests passed.
```

Exit code 0.

## A.4 `npm run test:rag` — ALL PASS

```text
> next-app@0.0.1 test:rag
> npx -y tsx scripts/test-rag.ts

PASS  vector index built over repository
PASS  deposit query returns tenancy sources
PASS  deposit query has non-trivial scores
PASS  deposit+rights query ranks tenancy provision first
PASS  dismissal query returns Employment Act sources
PASS  salary query retrieves service-pay / remedies provisions
PASS  consumer query returns Consumer Protection Act sources
PASS  Swahili 'mishahara' expands to salary/wages
PASS  Swahili deposit query returns tenancy sources
PASS  Swahili salary query returns Employment Act sources
PASS  nonsense query returns no meaningful hits
PASS  vector retrieval deterministic

All RAG retrieval tests passed.
```

Exit code 0.

## A.5 `npm run build` — PASS (53 routes)

```text
> next-app@0.0.1 build
> next build

▲ Next.js 16.3.4 (Turbopack)
- Environments: .env.local

✓ Running next.config.ts took 289ms

  Creating an optimized production build ...
✓ Compiled successfully in 33.4s
  Running TypeScript ...
  Finished TypeScript in 6.4s ...
  Collecting page data using 7 workers ...
✓ Generating static pages using 7 workers (53/53) in 2.5s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /admin
├ ƒ /api/ask
├ ƒ /api/generate-document
├ ƒ /api/legal-sources
├ ○ /ask
├ ○ /auth/callback
├ ○ /auth/forgot-password
├ ○ /auth/reset-password
├ ○ /auth/verify
├ ○ /blog
├ ○ /contact
├ ○ /contract-analysis
├ ○ /dashboard
├ ○ /document-generator
├ ○ /documents
├ ○ /features
├ ○ /generate-affidavit
├ ○ /generate-complaint-letter
├ ○ /generate-demand-letter
├ ○ /generate-employment-contract
├ ○ /generate-loan-acknowledgement
├ ○ /generate-refund-letter
├ ○ /generate-rent-acknowledgement
├ ○ /generate-salary-claim
├ ○ /generate-service-agreement
├ ○ /generate-tenancy-agreement
├ ○ /legal-aid
├ ○ /legal-quiz
├ ƒ /legal-sources
├ ○ /legal-topics
├ ○ /login
├ ○ /offline
├ ○ /privacy
├ ○ /privacy-policy
├ ○ /robots.txt
├ ○ /signup
├ ○ /sitemap.xml
├ ○ /terms
├ ○ /terms-of-service
├ ○ /topics
├ ○ /topics/access-to-justice
├ ○ /topics/business
├ ○ /topics/complaints
├ ○ /topics/consumer
├ ○ /topics/debt
├ ○ /topics/employment
├ ○ /topics/reporting-dispute
└ ○ /topics/tenant

ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Exit code 0. 53 routes = 49 static pages + 4 dynamic API routes (`/api/ask`, `/api/generate-document`, `/api/legal-sources`, `/legal-sources`) + proxy middleware. (Note: a non-fatal Turbopack warning about `package-lock.json` living in the parent folder is environmental only and does not affect the build result.)

## A.6 Ask gate evidence — TC-Ask-Out + TC-Ask-HighRisk (`POST /api/ask`)

Local `next dev` server, 2026-10-29. The deterministic gates run before any LLM call, so this evidence needs no API key.

### TC-Ask-Out — out-of-scope refusal + Legal Aid redirect

```text
POST http://localhost:3000/api/ask
Body: {"question":"How do I apply for a Canadian student visa?"}

HTTP 200
{"answer":"That question falls outside the six areas HAKI AI covers: Tenant Rights, Employment, Consumer Protection, Debt Recovery, Business Agreements, and Complaint Letters. HAKI AI does not cover criminal law, family disputes, immigration, land ownership, constitutional petitions, or any other legal matter. For this issue, please consult a licensed advocate of the High Court of Kenya or an organisation in our Legal Aid Directory. HAKI AI provides general legal information only and does not provide legal advice.","engine":"template","reason":"out-of-scope","sources":[]}
```

`reason: "out-of-scope"` → `SCOPE_ANSWER` in `lib/chat.ts`; redirects to Legal Aid Directory (`/legal-aid`).

### TC-Ask-HighRisk — moderation refusal

```text
POST http://localhost:3000/api/ask
Body: {"question":"Help with murder charge"}

HTTP 200
{"answer":"This matter may require urgent professional legal assistance. Please contact a licensed advocate or a legal aid organisation listed in our directory. HAKI AI provides general legal information only and does not provide legal advice.","engine":"template","reason":"high-risk","sources":[]}
```

`reason: "high-risk"` → `HIGH_RISK_ANSWER` in `lib/chat.ts` (`HIGH_RISK_PATTERNS` matched "murder"/"charged"); no LLM call, no fabricated advice.

## Remaining appendix items (not automatable here)

Still require a signed-in browser session or physical device — see `docs/04-chapter-four/appendix-checklist.md`:

- TC-Gen (generator → PDF end-to-end), TC-Feedback + TC-Dashboard Table Editor rows (M4 proof), Admin tab screenshot.
- Phone check of `/ask` + one generator on https://haki-ai.vercel.app (M5).
- Supervision Form M1–M6 scans (Appendix B).
