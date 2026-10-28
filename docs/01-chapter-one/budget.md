# HAKI AI — Budget (M1, from actual stack in `package.json`)

| Item | Cost (KES) | Notes / Evidence |
|------|-----------|------------------|
| Laptop (student-owned) | 0 (sunk) | Development machine |
| Next.js + React + Tailwind | 0 | Open source — `package.json` deps |
| Supabase free tier (Auth + Postgres + RLS) | 0 | `lib/supabase-client.ts`, `supabase/schema.sql` |
| Vercel hosting (live `SITE_URL`) | 0 | `app/layout.tsx:12` haki-ai.vercel.app; `netlify.toml` kept as fallback |
| Internet bundles (build + deploy + tests) | ~3,000 | `npm run build`, `npm run test:grounding` runs |
| Kenya Law sources | 0 | Public — links in `lib/legal-sources.ts`, mirrored `docs/dataset/*.csv` |
| Printing + binding (Ch.1–4 + prelim + appendix) | ~2,500 | Department template |
| Transport (supervision visits M1–M6) | ~2,000 | 6 signatures required — missing signatures = fail |
| **Total cash outlay** | **~7,500** | No paid licences |

Licence note (evidence `lib/legal-sources.ts:71-72`): legislative content carries no copyright; Kenya Law PDF copies CC BY-NC-SA 4.0.
