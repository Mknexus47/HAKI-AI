# HAKI AI — Chapter Three (start): Functional Test Report (DSE 315 Milestone M3)

Date: 2026-10-14. Machine: Windows + Node (see `node.exe` path in lint output). Commands run from repo root.

## 3.1 Static checks

| Command | Result | Evidence |
|---------|--------|----------|
| `npm run typecheck` (`tsc --noEmit`) | **PASS** (after fix) | Fixed `lib/pdf.ts: downloadPdf` Blob typing: `Uint8Array<ArrayBufferLike>` → copy to fresh `ArrayBuffer` (`copy.buffer as ArrayBuffer`), matching `lib/docx.ts:220` pattern. Before fix: `TS2322 Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'` at `lib/pdf.ts(420,26)`. After fix: clean. |
| `npm run lint` (`eslint`) | **FAIL — pre-existing, not code** | `ESLint 10.11.0 / TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function` at `eslint-plugin-react/lib/util/version.js` (via `eslint-config-next`) while linting `app/about/page.tsx`. Toolchain mismatch (ESLint 10 vs `eslint-config-next@16.3.4` react plugin), unrelated to app code. Recommend panel note: typecheck + build + grounding are the gates; lint to be re-run after `eslint-config-next` update. |
| `npm run build` (`next build`) | **PASS — 48 routes** | Static (○) all pages + dynamic (ƒ) `/api/generate-document`, `/api/legal-sources`, `/legal-sources`. 9 generators + `/ask` + `/dashboard` + `/admin` + `/legal-aid` + `/topics/*` all prerendered. |

## 3.2 Grounding tests (`npm run test:grounding` → `scripts/test-grounding.ts`)

**Result: ALL PASS.** Coverage per doc type (retrieval sufficient, citation validation, references resolve, Constitution-not-by-default, keyword overlap, evidence exists): demand-letter, rent-acknowledgement, service-agreement, loan-acknowledgement, complaint-letter, refund-letter, tenancy-agreement, employment-contract, affidavit. Plus: fabricated Section 99 rejected, invented case law rejected, insufficient evidence detected, limitation notice disclosed, no authorities when insufficient, missing fields flagged, missing-info rendered, DOCX ZIP magic / document.xml / content-types / EOCD, stale-source flag, determinism.

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

Screenshots go in Appendix A (see `docs/04-chapter-four/appendix-checklist.md`).
