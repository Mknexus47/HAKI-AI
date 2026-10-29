<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HAKI AI — DSE 315 Milestone Tracker (Zetech, DSE 315 Computer Systems Project)

> DO NOT restart this project from scratch. The system is ~75% built.
> Missing work is DOCUMENTATION + DIAGRAMS, not code. Generate docs FROM the existing code (reverse-engineer), never rebuild the system.

## Capability update (Oct 28 2026 — SEO + tooling pass, commit `2ce0ab2`/`376132d`)
- Per-page SEO metadata on every route (`lib/seo.ts` `pageMetadata`: title + canonical + OG/Twitter; `noindex` for login/signup/dashboard/admin/auth/offline); `app/sitemap.ts` + `app/robots.ts`; JSON-LD (`websiteJsonLd`) in `app/layout.tsx`.
- `proxy.ts` (Next 16 middleware): sign-in gate for all pages, `/admin` → `/dashboard?tab=admin`, verified-crawler UA bypass so the site is indexable behind the gate.
- Dashboard Admin tab (admin email only) via `components/dashboard/AdminPanel.tsx` + `dashboard.tab*` i18n keys.
- Tooling: `eslint` pinned to `^9` (ESLint 10 crashes `eslint-config-next`'s bundled react plugin); `npm run lint` now 0 problems. `typecheck`, `build` (53 routes), `test:grounding`, `test:rag` all green — paste outputs from Ch.3 `docs/03-chapter-three/test-report.md`.

## Capability update (Oct 2026 — post-proposal alignment)
- 10 document generators: 9 originals + `/generate-salary-claim` (salary/final-pay claim, grounded to Employment Act ss.19–20/35/41/49).
- OCR contract scanning at `/contract-analysis` (`tesseract.js`, in-browser, `lib/ocr.ts` + `lib/clause-analysis.ts`).
- Bilingual chat answers EN/SW (`lib/chat.ts`, `getAnswer(q, lang)`).
- RAG Ask: `POST /api/ask` (`app/api/ask/route.ts`) → local vector index (`lib/vector-store.ts`, TF-IDF + cosine, SW→EN query expansion) → Gemini (`lib/rag.ts`, env `GEMINI_API_KEY` in `.env.local`; free key from aistudio.google.com) → answer + Kenya Law source chips. Deterministic gates (high-risk/greeting/scope) and all failures fall back to `lib/chat.ts` templates — the endpoint works with no key.
- Tests: `npm run test:grounding` (documents) AND `npm run test:rag` (vector retrieval). Both must pass before demo.

## Kaggle ruling (important — stops confusion)
- Kaggle + "collect data and clean it" does NOT apply to this project.
- That instruction is for DDA/DAC analytics projects. DSE 315 for DIT/DBIT/DCF/DCS/DSE is a SYSTEM build.
- Our "data" = (1) curated legal repository in `lib/legal-sources.ts` (7 Kenyan Acts, Kenya Law links), (2) Supabase tables in `supabase/schema.sql` + `supabase/migrations/`. Already collected/cleaned. No CSV download needed.
- If a supervisor asks for "dataset", show `LEGAL_SOURCES`/`LEGAL_PROVISIONS` + `document_generations`/`feedback` tables as the dataset. Do not add Kaggle.

## Milestone status (maps to Course Outline pp.2-5)

### M1 — Planning & Analysis (Ch.1: cover + Ch.1) — DOCS DONE, SIGNATURE MISSING
- DONE (evidence): working Next.js 16 + React 19 app (`app/`, `lib/`, `components/`); 10 generators live (`app/generate-*/`); Ask assistant (`app/ask/page.tsx` + `lib/chat.ts`); bilingual EN/SW (`lib/i18n.ts`); deployed URL `https://haki-ai.vercel.app` (`lib/site.ts`).
- DONE (docs): `docs/01-chapter-one/` — `chapter-one.md` (background, problem, general + 5 specific objectives, 6-area scope, FR-1..FR-11), `gantt.csv` (Wk1–Wk12), `budget.md`, `prototype-review.md`.
- REMAINING: fill cover/abstract placeholders in `docs/00-preliminary/preliminary-pages.md`; get supervisor sign on Supervision Form M1.

### M2 — Design & Modelling (Ch.2) — DOCS DONE, SIGNATURE MISSING
- DONE (evidence): real UI exists (reverse-engineer from it); DB schema exists (`supabase/schema.sql`: document_requests, documents, feedback, flagged_sessions, legal_sources, legal_provisions, document_generations, document_versions + RLS).
- DONE (docs): `docs/02-chapter-two/chapter-two.md` — Mermaid use-case (Visitor/Member/Admin), Ask sequence, Generate sequence (steps 1–7), ERD from schema FKs, Ask + Generate flowcharts (§2.6/§2.7), 5 traced UI wireframes (§2.5). Screenshot assets in `docs/screenshots/`.
- REMAINING: export Mermaid → PNG in draw.io if the department requires non-Mermaid figures (1:1 trace); get M2 sign-off.

### M3 — Dev & Testing Part I (Ch.3 start) — DOCS DONE, SIGNATURE MISSING
- DONE (evidence): `lib/documents.ts` (fixed templates), `lib/legal-retrieval.ts`, `lib/legal-generation.ts` + `validateCitations`, `lib/pdf.ts`, `lib/docx.ts`, `lib/moderation.ts`, `scripts/test-grounding.ts`, `scripts/test-rag.ts`.
- DONE (docs): `docs/03-chapter-three/test-report.md` updated 2026-10-28 — `typecheck` clean, `lint` 0 problems (ESLint pinned to ^9, commit `376132d`), `build` 53 routes, `test:grounding` + `test:rag` all pass, manual TC table incl. SEO + live-URL rows.
- DONE (terminal/API evidence, 2026-10-29): `docs/03-chapter-three/terminal-evidence.md` — pasted outputs of typecheck, lint, test:grounding (all PASS), test:rag (all PASS), build (53 routes), plus TC-Ask-Out + TC-Ask-HighRisk via `POST /api/ask` (deterministic gates, no key needed). Appendix checklist terminal/refusal items ticked.
- REMAINING: UI screenshots for TC-Gen, TC-Feedback, TC-Dashboard, Admin tab; phone check; get M3 sign-off.

### M4 — Dev, Testing & DB Integration Part II — LIVE DB VERIFIED, DEMO LEFT
- DONE (evidence): `lib/supabase-client.ts`, `lib/supabase-server.ts`, `supabase/migrations/20260925235900_haki_ai_mvp_schema.sql`, `20261012000000_legal_grounding.sql`; RLS policies in schema; dashboard (`app/dashboard/page.tsx`), drafts save/resume, admin tab (`components/dashboard/AdminPanel.tsx`).
- VERIFIED Oct 2026: live project `htdjeeqdmsojgescanix` has all tables, auth healthy, `legal_sources` = 7 rows, `legal_provisions` = 21→22 rows; public read works with the publishable key in `.env.local`; `GET /api/legal-sources` returns DB data.
- VERIFIED 2026-10-28: `supabase/sql/sync-dataset-2026-10-20.sql` regenerated (`npx tsx scripts/generate-dataset-sql.ts`) — repo is in sync (7 sources, 22 provisions incl. `emp-s19-20-payment`; only the date header differed).
- REMAINING: paste that SQL file in the Supabase dashboard SQL editor and run it (admin-write RLS blocks the publishable key); then demo save-draft → history → delete while signed in and screenshot Table Editor rows. Get M4 sign-off.

### M5 — Deployment & Preliminary Docs — NEARLY DONE, SIGNATURE MISSING
- DONE (evidence): live URL **verified 2026-10-28** (home renders at `https://haki-ai.vercel.app`); `netlify.toml` fixed (removed wrong `publish = ".next"`; now `@netlify/plugin-nextjs` fallback, Vercel is production); PWA `public/manifest.json` + `sw.js`; offline page `app/offline/page.tsx`.
- DONE (docs): preliminary pages drafted — `docs/00-preliminary/preliminary-pages.md` (cover, declaration, dedication, acknowledgement, abstract, TOC, list of figures, list of tables, abbreviations).
- DONE (CI, 2026-10-29): `.github/workflows/deploy.yml` — verify job (typecheck + lint) then Vercel production deploy on push to main; org/project IDs match `.vercel/project.json`. One-time setup: add repo secret `VERCEL_TOKEN`, push `haki-ai/` to https://github.com/Mknexus47/HAKI-AI.
- REMAINING: replace `[bracketed]` student/supervisor placeholders; check `/ask` + one generator on a phone; print/bind to department template; get M5 sign-off.

### M6 — Documentation Consolidation (Ch.4 + refs) — DOCS DONE, APPENDIX LEFT
- DONE (docs): `docs/04-chapter-four/chapter-four-refs-prelim.md` (summary, conclusions vs 5 objectives, limitations — lint/netlify items marked resolved, recommendations); `docs/04-chapter-four/references.md` (APA 7: legislation + books + reports + software docs); `docs/04-chapter-four/appendix-checklist.md` created.
- REMAINING: tick off remaining appendix items (TC-Gen/Feedback/Dashboard/Admin UI screenshots, Supabase Table Editor rows, phone check); the terminal-output items are done (`docs/03-chapter-three/terminal-evidence.md`). Scan Supervision Form M1–M6 (6 signatures = 50% of marking). Final supervisor sign before panel.

## Rules for any agent working here
1. Never delete/rebuild `app/`, `lib/`, `supabase/`. Docs go in NEW `docs/` folder only.
2. Before code changes, read `node_modules/next/dist/docs/` per the block above + run `npm run typecheck`.
3. Panel marking = 50% supervision (6 signatures) + 50% panel (functionality demo + docs quality + defence). Missing signatures = fail even with good code. Prioritise getting each Milestone signed.
4. Demo order for panel: Home → Ask (in-scope + refusal) → Document Generator (1 doc end-to-end + PDF) → Legal Sources → Legal Aid → Dashboard.
