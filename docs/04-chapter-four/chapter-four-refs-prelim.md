# HAKI AI — Chapter Four + Prelims + References (DSE 315 Milestones M5/M6)

## 4.1 Summary
HAKI AI ships as a Next.js 16 + React 19 PWA (48 routes, `npm run build` clean) backed by Supabase, delivering scoped legal information (Ask), 9 source-grounded document generators (PDF/DOCX with brand letterhead), a curated 7-Act Kenyan repository with Kenya Law links, a Legal Aid Directory, bilingual EN/SW access, and drafts/history/feedback/moderation persistence.

## 4.2 Conclusions vs objectives (§1.3)
1. Ask + scope enforcement — **achieved** (`app/ask`, `lib/chat.ts`, `lib/moderation.ts`; TC-Ask-In/Out pass).
2. Nine grounded generators — **achieved** (`lib/documents.ts`, `lib/legal-retrieval.ts`, `lib/legal-generation.ts`, `lib/pdf.ts`, `lib/docx.ts`; `test:grounding` all pass).
3. Curated repository — **achieved** (`lib/legal-sources.ts` 7 Acts; `docs/dataset/*.csv`; `legal_sources`/`legal_provisions` tables).
4. Legal Aid + bilingual — **achieved** (`app/legal-aid`, `lib/legal-aid.ts`, `lib/i18n.ts`).
5. Persistence/feedback/moderation — **achieved** (`supabase/schema.sql` 9 tables + RLS; `app/dashboard`, `app/admin`).

## 4.3 Limitations
- Six-area scope only; no criminal/family/land/immigration coverage (by design, `SCOPE_ANSWER`).
- No verbatim Act text (`verbatimQuote: null`); full-text check pending (`sourced-pending-fulltext-check`).
- History stores metadata + form data, not full text (privacy by design).
- `npm run lint` blocked by pre-existing ESLint 10 vs `eslint-config-next` plugin crash.
- `netlify.toml` publish (`.next`) is wrong for Next.js — deploy via Vercel (`SITE_URL`); Netlify needs `netlify-plugin-nextjs`.

## 4.4 Recommendations
1. Ingestion pipeline for verified full-text with `verbatimQuote + verified` gating.
2. Advocate review queue before `flagged-needs-review` release.
3. USSD/SMS fallback for offline users; more Kiswahili coverage.
4. Pin `eslint` compatible with `eslint-config-next` and re-run lint gate.

## References (APA, starter)
- Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill. (SDLC Ch.1–4 structure)
- Farley, D. (2021). *Modern software engineering*. Addison-Wesley. (CI: typecheck/build/test gates)
- Shelly, G. B., Cashman, T. J., & Rosenblatt, H. J. (2019). *Systems analysis and design* (12th ed.). Cengage. (Use-case/ERD/sequence Ch.2)
- National Council for Law Reporting. (2010–2024). *Kenya Law* — Constitution 2010; Employment Act 2007; Consumer Protection Act 2012 (Cap. 501); Law of Contract Act (Cap. 23); Rent Restriction Act (Cap. 296); Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301); Oaths and Statutory Declarations Act (Cap. 15). https://kenyalaw.org (full URLs in `lib/legal-sources.ts` + `docs/dataset/legal_sources.csv`)
- Supabase docs; Next.js 16 docs (`node_modules/next/dist/docs/`); Vercel docs (deployment M5).

## Preliminary pages (M5 — paste into department template)
Cover (title HAKI AI, DSE 315 Computer Systems Project, Zetech University, student name/adm, supervisor, Oct 2026) → Declaration → Dedication → Acknowledgement → Abstract (150 words: problem, 5 objectives, 7-Act grounding, 48-route build, all grounding tests pass, 6-area scope) → TOC → List of Figures (use-case, Ask sequence, Generate sequence, ERD, 5 wireframes, Gantt) → List of Tables (FR-1..FR-11, TC-Ask/Gen, budget) → Abbreviations (RAG, RLS, PWA, EN/SW, eKLR).

## Appendix checklist
- A: screenshots (Ask in-scope + refusal, 9 PDFs, Sources, Aid, Dashboard, Admin, Supabase Table Editor rows, offline page, `build` + `test:grounding` terminals).
- B: Supervision Form scans M1–M6 (6 signatures — 50% of marking).
- C: `docs/dataset/legal_sources.csv` + `legal_provisions.csv` printout (the "dataset" for DSE 315 system build — NOT Kaggle; see AGENTS.md Kaggle ruling).
