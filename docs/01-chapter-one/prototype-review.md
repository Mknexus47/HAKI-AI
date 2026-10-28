# HAKI AI — Prototype Review (M1, traced from live routes)

Live: https://haki-ai.vercel.app (evidence `app/layout.tsx:12`). Build Oct 2026: 48 routes, `npm run build` clean.

| # | Page | Route | Evidence | Demo action |
|---|------|-------|----------|-------------|
| 1 | Home | `/` | `app/page.tsx` + SplashScreen | Landing + scope notice |
| 2 | Ask | `/ask` | `app/ask/page.tsx`, `lib/chat.ts` | In-scope answer THEN out-of-scope refusal (`SCOPE_ANSWER`) |
| 3 | Generators (9) | `/generate-demand-letter` … `/generate-affidavit` | `lib/documents.ts` 9 `*_DOC_TYPE`, `app/api/generate-document/route.ts` | 1 doc end-to-end + PDF download (`lib/pdf.ts`) + DOCX (`lib/docx.ts`) |
| 4 | Legal Sources | `/legal-sources` | `lib/legal-sources.ts`, `app/api/legal-sources/route.ts` | Open Kenya Law link; show verification status |
| 5 | Legal Aid | `/legal-aid` | `lib/legal-aid.ts` | Out-of-scope referral path |
| 6 | Dashboard | `/dashboard` | `supabase/schema.sql: document_requests/documents`, drafts save/resume | Save draft → history → delete while signed in |
| 7 | Admin | `/admin` | `supabase/schema.sql: flagged_sessions/feedback` | Flagged queue review |

M3 test pass (Oct 14 2026): `typecheck` PASS (after `lib/pdf.ts` Blob fix), `build` PASS (48 routes), `test:grounding` PASS (all), `lint` FAIL pre-existing (ESLint 10 vs `eslint-config-next` `react/display-name` plugin crash — not code).
