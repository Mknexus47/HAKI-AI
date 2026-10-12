<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HAKI AI — DSE 315 Milestone Tracker (Zetech, DSE 315 Computer Systems Project)

> DO NOT restart this project from scratch. The system is ~75% built.
> Missing work is DOCUMENTATION + DIAGRAMS, not code. Generate docs FROM the existing code (reverse-engineer), never rebuild the system.

## Kaggle ruling (important — stops confusion)
- Kaggle + "collect data and clean it" does NOT apply to this project.
- That instruction is for DDA/DAC analytics projects. DSE 315 for DIT/DBIT/DCF/DCS/DSE is a SYSTEM build.
- Our "data" = (1) curated legal repository in `lib/legal-sources.ts` (7 Kenyan Acts, Kenya Law links), (2) Supabase tables in `supabase/schema.sql` + `supabase/migrations/`. Already collected/cleaned. No CSV download needed.
- If a supervisor asks for "dataset", show `LEGAL_SOURCES`/`LEGAL_PROVISIONS` + `document_generations`/`feedback` tables as the dataset. Do not add Kaggle.

## Milestone status (maps to Course Outline pp.2-5)

### M1 — Planning & Analysis (Ch.1: cover + Ch.1) — CODE DONE, DOC MISSING
- DONE (evidence): working Next.js 16 + React 19 app (`app/`, `lib/`, `components/`); 9 generators live (`app/generate-*/`); Ask assistant (`app/ask/page.tsx` + `lib/chat.ts`); bilingual EN/SW (`lib/i18n.ts`); deployed URL in `app/layout.tsx` (haki-ai-virid.vercel.app).
- NOT DONE: `docs/01-chapter-one/` (background, problem, general + 4-5 specific objectives, scope 6 areas, functional requirements list, Gantt chart, budget table, prototype review).
- HOW TO DO: create `docs/` folder; write Ch.1 FROM the code (objectives = Ask + Generate + Grounding + Aid Directory + Bilingual); draw Gantt in Excel (Wk1 setup, Wk2 design, Wk3-9 build, Wk7-8 deploy, Wk9-10 docs, Wk12 panel); budget = laptop + hosting (Vercel free) + Supabase free + internet. Get supervisor sign on Supervision Form M1.

### M2 — Design & Modelling (Ch.2) — CODE DONE, DIAGRAMS MISSING
- DONE (evidence): real UI exists (reverse-engineer from it); DB schema exists (`supabase/schema.sql`: document_requests, documents, feedback, flagged_sessions, legal_sources, legal_provisions, generations, versions + RLS).
- NOT DONE: `docs/02-chapter-two/` with UI sketches (Home, Ask, Generator form, PDF output, Dashboard), flowchart (Ask flow, Generate flow steps 1-7), UML use-case (Actors: Visitor, Member, Admin) + sequence diagram, ERD diagram.
- HOW TO DO: screenshot each page → trace as wireframe boxes; flowchart from `lib/legal-retrieval.ts` (steps 1-5) + `lib/legal-generation.ts` (steps 6-7); ERD from `supabase/schema.sql` foreign keys (auth.users → document_requests/documents/generations). Free tools: draw.io / dbdiagram.io. Get M2 sign-off.

### M3 — Dev & Testing Part I (Ch.3 start) — MOSTLY DONE, TEST REPORT MISSING
- DONE (evidence): `lib/documents.ts` (9 fixed templates), `lib/legal-retrieval.ts`, `lib/legal-generation.ts` + `validateCitations`, `lib/pdf.ts`, `lib/docx.ts`, `lib/moderation.ts`, `scripts/test-grounding.ts` (`npm run test:grounding`).
- NOT DONE: formal functional test table (test-case ID, input, expected, actual, pass/fail screenshots); `npm run typecheck` + `npm run lint` + `npm run build` clean proof.
- HOW TO DO: run `npm run typecheck; npm run lint; npm run build; npm run test:grounding`, paste outputs into Ch.3 test table; test each of the 9 generators + Ask in-scope/out-of-scope + high-risk refusal; screenshot results. Commit all `app/api/` + `lib/legal-*` untracked files first (see git status). Get M3 sign-off.

### M4 — Dev, Testing & DB Integration Part II — CODE DONE, INTEGRATION PROOF MISSING
- DONE (evidence): `lib/supabase-client.ts`, `lib/supabase-server.ts`, `supabase/migrations/20260925235900_haki_ai_mvp_schema.sql`, `20261012000000_legal_grounding.sql`; RLS policies in schema; dashboard (`app/dashboard/page.tsx`), drafts save/resume, admin (`app/admin/page.tsx`).
- NOT DONE: proof that live Supabase project has migrations applied + seeded `legal_sources`; integration test (generate doc → row in `document_generations` → version in `document_versions`); uncommitted changes still in git status (MUST commit).
- HOW TO DO: `npx supabase db push` or run `schema.sql` in dashboard SQL editor; insert seed sources; demo save-draft → history → delete while signed in; screenshot Supabase Table Editor rows. Get M4 sign-off.

### M5 — Deployment & Preliminary Docs — HALF DONE
- DONE (evidence): `netlify.toml` present, `SITE_URL` set, PWA `public/manifest.json` + `sw.js`, offline page `app/offline/page.tsx`.
- NOT DONE: verify live URL actually opens (fix `netlify.toml` publish — `.next` is wrong for Next; use Vercel OR `netlify-plugin-nextjs`); preliminary pages (cover, declaration, dedication, acknowledgement, abstract, TOC, list of figures/tables, abbreviations).
- HOW TO DO: deploy via Vercel (`vercel --prod`) since `SITE_URL` is vercel; confirm `/ask` + one generator work on phone; then write prelim pages to department template. Get M5 sign-off.

### M6 — Documentation Consolidation (Ch.4 + refs) — NOT DONE
- NOT DONE: `docs/04-chapter-four/` (summary, conclusions vs objectives, recommendations, limitations), references (Pressman 2022, Farley 2020, Shelly et al. 2019 + Kenya Law URLs), appendix (test screenshots, supervision form scans).
- HOW TO DO: one paragraph per specific objective (achieved? evidence file); limitations = 6-area scope, no verbatim Act text, pending full-text check; references in APA. Final supervisor sign on Project Supervision Form before panel.

## Rules for any agent working here
1. Never delete/rebuild `app/`, `lib/`, `supabase/`. Docs go in NEW `docs/` folder only.
2. Before code changes, read `node_modules/next/dist/docs/` per the block above + run `npm run typecheck`.
3. Panel marking = 50% supervision (6 signatures) + 50% panel (functionality demo + docs quality + defence). Missing signatures = fail even with good code. Prioritise getting each Milestone signed.
4. Demo order for panel: Home → Ask (in-scope + refusal) → Document Generator (1 doc end-to-end + PDF) → Legal Sources → Legal Aid → Dashboard.
