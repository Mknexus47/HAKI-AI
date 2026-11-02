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
- [x] `12-tc-gen-form.png` — TC-Gen step 1: filled salary-claim form + live preview + draft saved (2026-11-01)
- [x] `13-tc-gen-result.png` — TC-Gen step 2: generation success + verified legal references (2026-11-01)
- [x] `tc-gen-salary-claim.pdf` — TC-Gen step 3: the actual PDF produced end-to-end (2026-11-01)
- [x] `14-tc-feedback-widget.png` — feedback widget, negative path with reason chips + comment box (2026-11-01)
- [x] `15-mobile-ask.png` — mobile viewport: Ask question + grounded answer (2026-11-01)
- [x] `16-mobile-generator.png` — mobile viewport: salary-claim generator (2026-11-01)
- [x] `17-mobile-ask-sources.png` — mobile viewport: Kenya Law source chips + feedback widget (2026-11-01)
- [x] Ch.2 diagram PNG exports for binding — `docs/02-chapter-two/diagrams/fig-01.png` … `fig-06.png` (use-case, Ask sequence, Generate sequence, ERD, Ask flowchart, Generate flowchart; rendered 2026-11-01)

Still to capture (paste terminal output or DevTools screenshot):

- [x] TC-Ask-Out — out-of-scope refusal + Legal Aid redirect (2026-10-29: `docs/03-chapter-three/terminal-evidence.md` §A.6 — `POST /api/ask` returns `reason: "out-of-scope"`)
- [x] TC-Ask-HighRisk — moderation refusal (2026-10-29: `docs/03-chapter-three/terminal-evidence.md` §A.6 — `reason: "high-risk"`)
- [ ] TC-Gen — one full generator run end-to-end (form → preview → PDF opened) — *UI steps captured 2026-11-01 (`12`/`13` + `tc-gen-salary-claim.pdf`); tick after opening the PDF on your machine*
- [ ] TC-Feedback — feedback row in Supabase Table Editor — *widget UI captured (`14`); the DB row needs a signed-in run: sign in → click thumbs → Supabase Table Editor → `feedback`*
- [ ] TC-Dashboard — save draft → reload → resume → delete, plus Table Editor rows in `document_requests` / `document_generations` / `document_versions` (doubles as M4 proof) — *needs a signed-in session*
- [ ] Admin tab — `/dashboard?tab=admin` showing flagged sessions/feedback — *needs the admin (`michaelkariuki281@gmail.com`) session*
- [x] Terminal: `npm run typecheck` (clean) — `docs/03-chapter-three/terminal-evidence.md` §A.1
- [x] Terminal: `npm run lint` (0 problems) — §A.2
- [x] Terminal: `npm run build` (53 routes) — §A.5
- [x] Terminal: `npm run test:grounding` + `npm run test:rag` (all pass) — §A.3/§A.4
- [ ] Phone: https://haki-ai.vercel.app `/ask` + one generator working on mobile (M5) — *mobile-viewport captures exist (`15`/`16`/`17`); tick after testing on a physical phone against the live URL*

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
