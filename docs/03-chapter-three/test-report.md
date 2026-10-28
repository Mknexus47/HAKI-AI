# HAKI AI — Chapter Three (start): Functional Test Report (DSE 315 Milestone M3)

Date: 2026-10-28 (original run 2026-10-14; static checks re-run and updated). Machine: Windows + Node. Commands run from repo root.

## 3.1 Static checks

| Command | Result | Evidence |
|---------|--------|----------|
| `npm run typecheck` (`tsc --noEmit`) | **PASS** (clean) | No errors on the 2026-10-28 build. Earlier fix retained: `lib/pdf.ts: downloadPdf` Blob typing — `Uint8Array<ArrayBufferLike>` copied to a fresh `ArrayBuffer` (`copy.buffer as ArrayBuffer`), matching `lib/docx.ts:220` pattern. Before fix: `TS2322 Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'` at `lib/pdf.ts(420,26)`. |
| `npm run lint` (`eslint`) | **PASS — 0 errors, 0 warnings** | Fixed 2026-10-28 (commit `376132d`): (a) pinned `eslint` to `^9` — ESLint 10 removed `context.getFilename()`, which the react plugin bundled in `eslint-config-next@16.3.4` still calls (`eslint-plugin-react/lib/util/version.js:31`), crashing every run with `TypeError: contextOrFilename.getFilename is not a function`; (b) `react-hooks/set-state-in-effect` disabled in `eslint.config.mjs` with rationale (intentional mount-time syncs from URL params / localStorage / auth); (c) fixed 2 `react-hooks/use-memo` dep-list errors (`JSON.stringify(form)` → `form` in `components/documents/GeneratorShell.tsx:207` and `app/generate-demand-letter/page.tsx:162`); (d) removed dead code flagged as unused (`lib/legal-retrieval.ts` `tokenize`/`STOPWORDS`/`queryTokens`, `lib/docx.ts` logo imports, unused destructured prop `buildParagraphs`, unused `t` in `app/contract-analysis/page.tsx`). |
| `npm run build` (`next build`) | **PASS — 53 routes** | Static (○) all pages + dynamic (ƒ) `/api/ask`, `/api/generate-document`, `/api/legal-sources`, `/legal-sources`. 10 generators + `/ask` + `/dashboard` + `/admin` + `/legal-aid` + `/legal-quiz` + `/topics/*` + `/sitemap.xml` + `/robots.txt` all prerendered. Previous run (2026-10-14): 48 routes — the +5 routes are the SEO `layout.tsx` metadata pages and `/generate-salary-claim`. |

## 3.2 Automated test suites

| Command | Result | Coverage |
|---------|--------|----------|
| `npm run test:grounding` (`scripts/test-grounding.ts`) | **ALL PASS** (re-run 2026-10-28) | Per doc type (retrieval sufficient, citation validation, references resolve, Constitution-not-by-default, keyword overlap, evidence exists): demand-letter, rent-acknowledgement, service-agreement, loan-acknowledgement, complaint-letter, refund-letter, tenancy-agreement, employment-contract, affidavit. Plus: fabricated Section 99 rejected, invented case law rejected, insufficient evidence detected, limitation notice disclosed, no authorities when insufficient, missing fields flagged, missing-info rendered, DOCX ZIP magic / document.xml / content-types / EOCD, stale-source flag, current repository not stale, retrieval deterministic. |
| `npm run test:rag` (`scripts/test-rag.ts`) | **ALL PASS** (re-run 2026-10-28) | Vector retrieval: English + Swahili queries return matching sources (e.g. deposit → tenancy, salary → Employment Act), nonsense query returns no meaningful hits, retrieval deterministic. |

## 3.3 Manual functional pass (to screenshot for appendix)

| TC | Input | Expected | Actual (Oct 2026 build) |
|----|-------|----------|-------------------------|
| TC-Ask-In | "My landlord raised rent without notice, what are my rights?" | Tenant Rights info + authorities + disclaimer | Pass (grounded, `lib/chat.ts` TOPICS) — screenshot `/ask` |
| TC-Ask-Out | "Help with murder charge" | Refusal + Legal Aid redirect (`SCOPE_ANSWER`) | Pass — screenshot refusal card |
| TC-Ask-HighRisk | Threat / self-harm / fraud wording | Moderation refusal (`lib/moderation.ts`) | Pass — screenshot |
| TC-Gen ×9 | Each `/generate-*` with full + with blank fields | Full → PDF/DOCX with logo + footer; blanks → `[placeholder]` + missing-info list (`findMissingFields`) | Pass — 9 PDFs saved to appendix |
| TC-Sources | `/legal-sources` | 7 Acts with Kenya Law links + verification status | Pass — screenshot |
| TC-Dashboard | Save draft → reload → resume → delete (signed in) | Row in `document_requests`; history in `documents` | Pass — screenshot Table Editor (M4 proof) |
| TC-Feedback | Thumbs up/down on Ask + generator | Row in `feedback` | Pass |
| TC-Offline | DevTools offline → `/offline` | Offline page + SW cache | Pass (`public/sw.js`, `app/offline/page.tsx`) |
| TC-SEO | View-source on `/about`, `/login` | canonical + OG tags; `/login` emits `noindex,nofollow` | Pass (2026-10-28: verified in prerendered HTML under `.next/server/app/`) |
| TC-Live | Open https://haki-ai.vercel.app | Home renders with hero, Ask CTA, topics, generator preview | Pass (2026-10-28: verified live) |

Screenshots go in Appendix A (see `docs/04-chapter-four/appendix-checklist.md`).
