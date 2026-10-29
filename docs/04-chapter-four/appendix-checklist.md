# HAKI AI — Appendix Checklist (DSE 315 Milestones M3–M6)

Print/collate in this order after the references. Tick each item before binding.

## Appendix A — Test and UI screenshots

Existing captures in `docs/screenshots/`:

- [x] `00-architecture.png` — system architecture
- [x] `01-home.png` — Home page
- [x] `02-ask-en.png` — Ask, English in-scope answer
- [x] `03-ask-sw.png` — Ask, Kiswahili
- [x] `04-document-generator.png` — Document generator index
- [x] `05-salary-claim.png` — Salary/final-pay claim generator
- [x] `06-ocr-extracted.png` — OCR extracted text (`/contract-analysis`)
- [x] `08-ocr-clauses.png` — Clause analysis findings
- [x] `09-legal-sources.png` — Legal sources (7 Acts, Kenya Law links)
- [x] `10-legal-aid.png` — Legal Aid Directory
- [x] `11-dashboard.png` — Dashboard (drafts/history)
- [x] `sample-contract.png` — sample contract used for OCR test

Still to capture (paste terminal output or DevTools screenshot):

- [x] TC-Ask-Out — out-of-scope refusal + Legal Aid redirect (2026-10-29: `docs/03-chapter-three/terminal-evidence.md` §A.6 — `POST /api/ask` returns `reason: "out-of-scope"`)
- [x] TC-Ask-HighRisk — moderation refusal (2026-10-29: `docs/03-chapter-three/terminal-evidence.md` §A.6 — `reason: "high-risk"`)
- [ ] TC-Gen — one full generator run end-to-end (form → preview → PDF opened)
- [ ] TC-Feedback — feedback row in Supabase Table Editor
- [ ] TC-Dashboard — save draft → reload → resume → delete, plus Table Editor rows in `document_requests` / `document_generations` / `document_versions` (doubles as M4 proof)
- [ ] Admin tab — `/dashboard?tab=admin` showing flagged sessions/feedback
- [x] Terminal: `npm run typecheck` (clean) — `docs/03-chapter-three/terminal-evidence.md` §A.1
- [x] Terminal: `npm run lint` (0 problems) — §A.2
- [x] Terminal: `npm run build` (53 routes) — §A.5
- [x] Terminal: `npm run test:grounding` + `npm run test:rag` (all pass) — §A.3/§A.4
- [ ] Phone: https://haki-ai.vercel.app `/ask` + one generator working on mobile (M5)

## Appendix B — Supervision Form scans (50% of marking)

- [ ] M1 — Planning & Analysis sign-off
- [ ] M2 — Design & Modelling sign-off
- [ ] M3 — Dev & Testing Part I sign-off
- [ ] M4 — Dev, Testing & DB Integration sign-off
- [ ] M5 — Deployment & Preliminary Docs sign-off
- [ ] M6 — Documentation Consolidation sign-off

## Appendix C — Dataset printout

- [ ] `docs/dataset/legal_sources.csv` — 7 Kenyan Acts (Kenya Law URLs, verification status)
- [ ] `docs/dataset/legal_provisions.csv` — 22 provisions (keywords + docTypes)
- [ ] Supabase Table Editor screenshot: `legal_sources` = 7 rows, `legal_provisions` = 22 rows after running `supabase/sql/sync-dataset-2026-10-20.sql`

Note for the panel: this project's "dataset" is the curated legal repository + Supabase tables — a DSE 315 **system** build, not a Kaggle/CSV analytics assignment (see the Kaggle ruling in `AGENTS.md`).
