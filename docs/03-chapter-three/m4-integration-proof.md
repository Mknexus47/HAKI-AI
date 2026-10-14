# HAKI AI — M4 Integration Proof (Supabase live)

Code evidence: `lib/supabase-client.ts`, `lib/supabase-server.ts`, `supabase/migrations/20260925235900_haki_ai_mvp_schema.sql`, `supabase/migrations/20261012000000_legal_grounding.sql`; RLS in `supabase/schema.sql`.

## Proof steps (screenshot each into Appendix A)

1. **Migrations applied**: `npx supabase db push` OR run `supabase/schema.sql` in Dashboard → SQL Editor. Verify in Table Editor: `document_requests`, `documents`, `feedback`, `flagged_sessions`, `legal_sources`, `legal_provisions`, `legal_source_versions`, `document_generations`, `document_versions`.
2. **Seed check**: `legal_sources` has 7 rows (constitution-ke-2010, employment-act-2007, consumer-protection-act-2012, law-of-contract-act, rent-restriction-act, landlord-tenant-shops-act, oaths-statutory-declarations-act) with `source_url` → kenyalaw.org and `verification_status = sourced-pending-fulltext-check`. Cross-check `docs/dataset/legal_sources.csv`.
3. **End-to-end**: signed in → `/generate-demand-letter` → fill → Generate → row appears in `document_generations` (`doc_type`, `provision_ids`, `validation_status=passed`) → version in `document_versions` (`generated_text`, `provision_snapshot`).
4. **Drafts**: save draft → row in `document_requests` (`user_id, doc_type` unique) → reload → resume → delete → row gone.
5. **RLS**: logged-out select on `documents` denied; `legal_sources` public read allowed; admin (`michaelkariuki281@gmail.com`) can select `feedback`/`flagged_sessions`.

Pending before M4 sign-off: confirm live Supabase project ref in `supabase/.temp/project-ref` matches Dashboard; paste Table Editor screenshots.
