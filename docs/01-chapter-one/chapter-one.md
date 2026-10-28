# HAKI AI — Chapter One: Planning & Analysis (DSE 315 Milestone M1)

> Reverse-engineered FROM the working codebase. Every claim below maps to an evidence file in `app/`, `lib/`, or `supabase/`. No rebuild — documentation only.

**System:** HAKI AI — Legal Information and Document Assistance Platform for Kenya
**Stack (evidence):** Next.js 16 + React 19 (`package.json`: `next@16.3.4`, `react@19.2.8`), Supabase (`lib/supabase-client.ts`, `lib/supabase-server.ts`), bilingual EN/SW (`lib/i18n.ts`), PWA (`public/manifest.json`, `public/sw.js`, `app/offline/page.tsx`)
**Live URL (evidence `app/layout.tsx:12`):** https://haki-ai.vercel.app
**Repository dataset:** `lib/legal-sources.ts` (7 Kenyan Acts, Kenya Law links) + `docs/dataset/legal_sources.csv`, `docs/dataset/legal_provisions.csv` + Supabase tables (`supabase/schema.sql`, `supabase/migrations/`)

## 1.1 Background

Access to basic legal information in Kenya is constrained by cost, language, and awareness. Advocates are expensive, most statutory text lives on Kenya Law in English legalese, and low-income citizens in areas such as tenant disputes, employment, consumer complaints, debt recovery, and small-business agreements often proceed without any written instrument.

HAKI AI addresses this gap as a cloud-hosted, AI-assisted legal-information platform (not a law firm). It provides:

1. **Ask assistant** (`app/ask/page.tsx` + `lib/chat.ts`) — answers general legal-information questions inside a strict six-topic scope, refuses out-of-scope / high-risk queries, and redirects to a human advocate.
2. **9 document generators** (`app/generate-*/` + `lib/documents.ts` + `app/document-generator/`, `app/documents/`) — demand letter, rent acknowledgement, service agreement, loan acknowledgement, complaint letter, refund letter, tenancy agreement, employment contract, affidavit.
3. **Source grounding** (`lib/legal-retrieval.ts` steps 1–5 + `lib/legal-generation.ts` steps 6–7 + `lib/legal-sources.ts` + `scripts/test-grounding.ts`) — every citation must resolve to a curated Kenyan provision with a Kenya Law URL; semantic-only matches are never cited; fabricated sections/cases are flagged `flagged-needs-review`.
4. **Legal Aid Directory** (`app/legal-aid/` + `lib/legal-aid.ts`) — referral path for out-of-scope users.
5. **Bilingual EN/SW** (`lib/i18n.ts`, `components/language-provider.tsx`) — scope-limitation disclaimer in both languages.
6. **Dashboard + persistence** (`app/dashboard/page.tsx`, `supabase/schema.sql`: `document_requests`, `documents`, `feedback`, `flagged_sessions`) — save/resume drafts, history, feedback ("Was this helpful?"), admin moderation queue.

Design constraint (evidence `lib/legal-sources.ts:1-19`): the repository stores concise descriptive summaries plus deep links — full authoritative text remains on Kenya Law; `verbatimQuote` is null for every seeded provision, so the generator can never emit a fake "quotation".

## 1.2 Problem Statement

1. Citizens cannot afford one-on-one legal drafting for routine instruments (demand letters, tenancy agreements, employment contracts).
2. Generic AI chatbots hallucinate Kenyan sections, articles, and case law (`lib/legal-generation.ts: CITATION_PATTERNS` + `validateCitations` exists precisely to catch this).
3. English-only tools exclude Kiswahili speakers (`lib/i18n.ts` provides SW strings).
4. No referral loop: users with criminal, family, land, or immigration matters get generic answers instead of a Legal Aid redirect (`lib/chat.ts: SCOPE_ANSWER` + `app/legal-aid/`).
5. No audit trail: drafts, versions, and feedback are lost without persistence (`supabase/schema.sql` + `supabase/migrations/20260925235900_haki_ai_mvp_schema.sql`, `20261012000000_legal_grounding.sql`).

## 1.3 Objectives

### General objective
To design and implement a cloud-hosted, source-grounded legal-information and document-assistance platform for Kenya covering sixCommon legal areas, with bilingual access, PDF/DOCX output, and Supabase persistence.

### Specific objectives (each maps to shipped code)
1. **Ask assistant with scope enforcement** — implement `app/ask/page.tsx` + `lib/chat.ts` (`TOPICS`, `SCOPE_ANSWER`) covering exactly six areas, with out-of-scope refusal and high-risk refusal. Evidence: commit "six-topic scope".
2. **Nine fixed-template generators with grounding** — implement `lib/documents.ts` (9 `*_DOC_TYPE` constants + `DOCUMENT_TITLES`) wired through `lib/legal-retrieval.ts` (retrieve) → `lib/legal-generation.ts` (generate + `validateCitations`) → `lib/pdf.ts` / `lib/docx.ts` (download). Evidence: `npm run test:grounding` — all tests passed (Oct 2026).
3. **Curated Kenyan legal repository** — seed `lib/legal-sources.ts` (`LEGAL_SOURCES`, `LEGAL_PROVISIONS`) with 7 Acts and Kenya Law URLs; mirror as `docs/dataset/*.csv` and Supabase `legal_sources` / `legal_provisions` tables. Acts: Constitution of Kenya 2010; Employment Act 2007 (No. 11 of 2007); Consumer Protection Act 2012 (Cap. 501); Law of Contract Act (Cap. 23); Rent Restriction Act (Cap. 296); Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301); Oaths and Statutory Declarations Act (Cap. 15).
4. **Legal Aid Directory + bilingual access** — implement `app/legal-aid/` + `lib/legal-aid.ts` and EN/SW strings in `lib/i18n.ts` including the scope-limitation disclaimer.
5. **Persistence, feedback, and moderation** — implement `supabase/schema.sql` tables `document_requests` (drafts), `documents` (history, metadata only), `feedback`, `flagged_sessions` with RLS owner-only + admin (`michaelkariuki281@gmail.com`); dashboards `app/dashboard/page.tsx`, `app/admin/page.tsx`.

## 1.4 Scope (6 areas — enforced in code)

**In scope** (evidence `lib/chat.ts:136-137`, `lib/i18n.ts:23`):
1. Tenant Rights
2. Employment
3. Consumer Protection
4. Debt Recovery
5. Business Agreements
6. Complaint Letters

**Out of scope (must refuse + refer):** criminal law, family disputes, immigration, land ownership, constitutional petitions, any other matter — redirect to Legal Aid Directory / licensed advocate of the High Court of Kenya. Disclaimer footer on every PDF (evidence `lib/pdf.ts: FOOTER_DISCLAIMER`): "General legal information only — not legal advice."

**System boundaries:**
- No verbatim Act text redistributed (licence: legislative content no copyright; Kenya Law PDFs CC BY-NC-SA 4.0 — see `lib/legal-sources.ts:71-72`).
- Document history stores metadata + form data only, never full document text (`supabase/schema.sql: documents` comment).
- PWA offline page (`app/offline/page.tsx`) covers connectivity loss, not legal coverage expansion.

## 1.5 Functional Requirements (traced to code)

| FR ID | Requirement | Evidence |
|-------|-------------|----------|
| FR-1 | User can ask legal-information questions in EN/SW and receive scoped answers | `app/ask/page.tsx`, `lib/chat.ts`, `lib/i18n.ts` |
| FR-2 | System refuses out-of-scope and high-risk queries with referral | `lib/chat.ts: SCOPE_ANSWER`, `lib/moderation.ts`, `app/legal-aid/` |
| FR-3 | User can generate 9 document types end-to-end (form → preview → PDF/DOCX) | `app/generate-*/`, `lib/documents.ts: buildParagraphsForDoc`, `lib/pdf.ts: downloadPdf`, `lib/docx.ts: downloadDocx` |
| FR-4 | Every citation resolves to repository evidence; fakes flagged | `lib/legal-retrieval.ts`, `lib/legal-generation.ts: validateCitations`, `scripts/test-grounding.ts` |
| FR-5 | User can browse verified legal sources with Kenya Law links | `app/legal-sources/`, `app/api/legal-sources/route.ts`, `lib/source-maintenance.ts` (staleness) |
| FR-6 | User can find legal aid contacts when out of scope | `app/legal-aid/`, `lib/legal-aid.ts` |
| FR-7 | Member can save/resume drafts and view/delete history | `supabase/schema.sql: document_requests, documents`, `app/dashboard/page.tsx` |
| FR-8 | User can submit "Was this helpful?" feedback | `supabase/schema.sql: feedback`, dashboard feedback widget |
| FR-9 | Admin can review flagged sessions and feedback | `supabase/schema.sql: flagged_sessions`, `app/admin/page.tsx` |
| FR-10 | App works on mobile, installs as PWA, degrades offline | `public/manifest.json`, `public/sw.js`, `app/offline/page.tsx`, `app/layout.tsx: OfflineSupport` |
| FR-11 | Brand letterhead (logo) on PDF + DOCX output, fail-safe offline | `lib/brand-logo.ts`, `lib/pdf.ts: withLogo`, `lib/docx.ts: logo.jpg` |

## 1.6 Gantt Chart (Wk1–Wk12 — see `gantt.csv`)

- Wk1: Project setup (Next.js 16 + React 19 scaffold, repo, Vercel link)
- Wk2: Requirements + design (scope 6 areas, schema in `supabase/schema.sql`)
- Wk3–Wk9: Build — Ask (`lib/chat.ts`), 9 generators (`lib/documents.ts`), grounding pipeline (`lib/legal-retrieval.ts`, `lib/legal-generation.ts`), PDF/DOCX (`lib/pdf.ts`, `lib/docx.ts`, `lib/brand-logo.ts`), i18n, Legal Aid, Dashboard/Admin
- Wk7–Wk8: Deploy (`SITE_URL` haki-ai.vercel.app in `app/layout.tsx`; `netlify.toml` present as alternative)
- Wk9–Wk10: Docs + testing (`npm run typecheck`, `npm run build`, `npm run test:grounding`, Ch.1–Ch.4 in `docs/`)
- Wk11: Supervision signatures M1–M6 (Project Supervision Form)
- Wk12: Panel demo (Home → Ask in-scope + refusal → Generator end-to-end + PDF → Legal Sources → Legal Aid → Dashboard)

## 1.7 Budget (see `budget.md`)

Laptop (student-owned, sunk cost) + Vercel free tier + Supabase free tier + internet bundles + printing/binding. No paid licences: Next.js / React / Supabase-js / Tailwind are open source (`package.json`).

## 1.8 Prototype Review (see `prototype-review.md`)

Working prototype live at `SITE_URL`: Home, Ask (in-scope answer + out-of-scope refusal demo), 9 generator forms, PDF output with footer disclaimer + brand logo, Legal Sources with Kenya Law links, Legal Aid, Dashboard (drafts/history), Admin. Screenshots to be pasted during M3 test pass.

---
*Next: M2 design artefacts in `docs/02-chapter-two/` (wireframes traced from `app/` pages, flowcharts from `lib/legal-retrieval.ts` + `lib/legal-generation.ts`, ERD from `supabase/schema.sql` FKs).*
