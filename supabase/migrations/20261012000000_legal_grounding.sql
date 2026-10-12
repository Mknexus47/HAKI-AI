-- HAKI AI — source-grounded generation schema
-- Run after the MVP schema. Run in: Supabase Dashboard → SQL Editor → Run,
-- or apply with the Supabase CLI (supabase db push).

-- ============================================================
-- Legal sources (verified repository of Kenyan authorities)
-- ============================================================
create table if not exists public.legal_sources (
  id text primary key,
  title text not null,
  citation text not null,
  jurisdiction text not null default 'Kenya',
  publisher text not null,
  publication_details text not null default '',
  effective_date date,
  source_url text not null,
  license_note text not null default '',
  verification_status text not null default 'sourced-pending-fulltext-check',
  version int not null default 1,
  last_checked_at timestamptz,
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Searchable legal provisions (RAG index with metadata)
-- ============================================================
create table if not exists public.legal_provisions (
  id text primary key,
  source_id text not null references public.legal_sources on delete cascade,
  article_or_section text not null,
  heading text not null,
  summary text not null default '',
  context_note text not null default '',
  keywords text[] not null default '{}',
  doc_types text[] not null default '{}',
  verification_status text not null default 'sourced-pending-fulltext-check',
  source_url text not null default '',
  retrieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Source version history (append-only — never silently replaced)
-- ============================================================
create table if not exists public.legal_source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.legal_sources on delete cascade,
  version int not null,
  change_note text not null,
  checked_at timestamptz not null default now(),
  checked_by text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Grounded generation records (metadata + evidence, not full text)
-- ============================================================
create table if not exists public.document_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  doc_type text not null,
  form_data jsonb not null default '{}'::jsonb,
  provision_ids text[] not null default '{}',
  validation_status text not null default 'passed',
  missing_info text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- Document version history (full snapshots for re-download)
-- ============================================================
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.document_generations on delete cascade,
  version_no int not null,
  generated_text text not null,
  provision_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.legal_sources enable row level security;
alter table public.legal_provisions enable row level security;
alter table public.legal_source_versions enable row level security;
alter table public.document_generations enable row level security;
alter table public.document_versions enable row level security;

-- Repository is public read (same as legal topics content).
create policy "legal_sources_public_read" on public.legal_sources
  for select using (true);
create policy "legal_provisions_public_read" on public.legal_provisions
  for select using (true);
create policy "legal_source_versions_public_read" on public.legal_source_versions
  for select using (true);

-- Repository writes: admin only.
create policy "legal_sources_admin_write" on public.legal_sources
  for all using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
create policy "legal_provisions_admin_write" on public.legal_provisions
  for all using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
create policy "legal_source_versions_admin_write" on public.legal_source_versions
  for all using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');

-- Generations/versions: owner only (+ admin select).
create policy "generations_select_own" on public.document_generations
  for select using (auth.uid() = user_id);
create policy "generations_insert_own" on public.document_generations
  for insert with check (auth.uid() = user_id);
create policy "generations_admin" on public.document_generations
  for select using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
create policy "versions_select_own" on public.document_versions
  for select using (
    exists (
      select 1 from public.document_generations g
      where g.id = document_versions.generation_id and g.user_id = auth.uid()
    )
  );
create policy "versions_insert_own" on public.document_versions
  for insert with check (
    exists (
      select 1 from public.document_generations g
      where g.id = document_versions.generation_id and g.user_id = auth.uid()
    )
  );

-- ============================================================
-- Seed: verified Kenyan sources (Kenya Law)
-- ============================================================
insert into public.legal_sources
  (id, title, citation, jurisdiction, publisher, publication_details, effective_date, source_url, license_note, verification_status, version, last_checked_at)
values
  ('constitution-ke-2010', 'Constitution of Kenya, 2010', 'Constitution of Kenya, 2010', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Published in Kenya Gazette Vol. CXII—No. 88 on 3 September 2010; assented to 4 August 2010; promulgated 27 August 2010.',
   '2010-08-27', 'https://kenyalaw.org/akn/ke/act/2010/constitution',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12'),
  ('employment-act-2007', 'Employment Act, 2007', 'Act No. 11 of 2007', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Act No. 11 of 2007; legislation as at 31 December 2022 (Kenya Law revision).',
   '2008-06-02', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12'),
  ('consumer-protection-act-2012', 'Consumer Protection Act, 2012', 'Cap. 501', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Cap. 501; published in Kenya Gazette Vol. CXV—No. 3 on 11 January 2013; assented to 13 December 2012; commenced 14 March 2013.',
   '2013-03-14', 'https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12'),
  ('law-of-contract-act', 'Law of Contract Act', 'Cap. 23', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Cap. 23; assented to 25 November 1960; commenced 1 January 1961; legislation as at 31 December 2022.',
   '1961-01-01', 'https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12'),
  ('rent-restriction-act', 'Rent Restriction Act', 'Cap. 296', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Cap. 296; assented to 24 August 1959; commenced 1 October 1959.',
   '1959-10-01', 'https://kenyalaw.org/akn/ke/act/1959/35',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12'),
  ('landlord-tenant-shops-act', 'Landlord and Tenant (Shops, Hotels and Catering Establishments) Act', 'Cap. 301 (Act No. 13 of 1965)', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Cap. 301; Act No. 13 of 1965; assented to 4 June 1965; commenced 1 November 1965; legislation as at 31 December 2022.',
   '1965-11-01', 'https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12'),
  ('oaths-statutory-declarations-act', 'Oaths and Statutory Declarations Act', 'Cap. 15', 'Kenya',
   'National Council for Law Reporting (Kenya Law)',
   'Cap. 15; legislation as at 26 April 2024 (as amended by the Statute Law (Miscellaneous Amendments) Act, 2024).',
   '1926-01-01', 'https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26',
   'Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.',
   'sourced-pending-fulltext-check', 1, '2026-10-12')
on conflict (id) do nothing;

-- ============================================================
-- Seed: searchable provisions
-- ============================================================
insert into public.legal_provisions
  (id, source_id, article_or_section, heading, summary, context_note, keywords, doc_types, verification_status, source_url)
values
  ('const-a2-supremacy', 'constitution-ke-2010', 'Article 2', 'Supremacy of the Constitution',
   'Establishes the Constitution as the supreme law; any law inconsistent with it is void to the extent of the inconsistency.',
   'Chapter One. Confirm the article text on the Kenya Law page before relying on it.',
   array['constitution','constitutional','supremacy','supreme law'], array['employment-contract','tenancy-agreement'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2010/constitution'),
  ('const-a41-fair-labour', 'constitution-ke-2010', 'Article 41', 'Labour relations — fair labour practices',
   'Guarantees fair labour practices and related labour rights. Confirm the current article text on Kenya Law; do not restate its wording from memory.',
   'Bill of Rights. Retrieved only when the matter squarely concerns labour rights.',
   array['fair labour','labour rights','fair practices','workers rights'], array['employment-contract'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2010/constitution'),
  ('emp-s27-hours', 'employment-act-2007', 'Section 27', 'Hours of work and rest days',
   'Regulates working hours and rest-day entitlements. Confirm current thresholds in the source text.',
   'Part on basic conditions of employment.',
   array['hours','working hours','overtime','rest day','work week'], array['employment-contract'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('emp-s28-leave', 'employment-act-2007', 'Section 28', 'Annual leave',
   'Provides for minimum annual leave entitlements after twelve consecutive months of service. Confirm current thresholds in the source text.',
   'Part on basic conditions of employment.',
   array['leave','annual leave','holiday','vacation','rest'], array['employment-contract'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('emp-s35-service-pay', 'employment-act-2007', 'Section 35(5) (see source for subsection)', 'Service pay on termination in specified cases',
   'Addresses service pay rates where that section applies. Confirm applicability and current rates in the source text.',
   'Termination provisions. Applicability is conditional — confirm against the source.',
   array['service pay','gratuity','severance','terminal dues'], array['employment-contract','demand-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('emp-s41-termination', 'employment-act-2007', 'Sections 41, 43 and 45 (see source)', 'Fair reason and fair procedure before termination',
   'Requires a valid reason and fair procedure before termination; the employer must prove the reason. Confirm the sections in the source text.',
   'Termination and dismissal provisions.',
   array['termination','dismissal','dismissed','fired','unfair termination','notice','summary dismissal'], array['employment-contract','complaint-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('emp-s49-remedies', 'employment-act-2007', 'Section 49 (see source)', 'Remedies for wrongful dismissal and unfair termination',
   'Sets the remedies available for wrongful dismissal and unfair termination. Confirm the list of remedies in the source text.',
   'Remedies provisions guiding the Employment and Labour Relations Court.',
   array['remedies','compensation','reinstatement','damages','wrongful dismissal'], array['employment-contract','complaint-letter','demand-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('emp-s51-certificate', 'employment-act-2007', 'Section 51 (see source)', 'Certificate of service',
   'Provides for issuance of a certificate of service. Confirm the wording in the source text.',
   'Post-employment provisions.',
   array['certificate of service','reference','clearance'], array['employment-contract'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('emp-s6-harassment-policy', 'employment-act-2007', 'Section 6 (see source)', 'Policy statement on sexual harassment',
   'Requires qualifying employers to issue a policy statement on sexual harassment. Confirm the employer threshold and form in the source text.',
   'Employee rights provisions; detailed forms sit in subsidiary rules.',
   array['harassment','policy statement','workplace policy'], array['employment-contract'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31'),
  ('cpa-s3-purposes', 'consumer-protection-act-2012', 'Section 3 (purposes; see source)', 'Purposes — fair consumer market and unfair practices',
   'Establishes the framework for a fair consumer market and protection against unconscionable, unfair or improper trade practices.',
   'Part I – Preliminary.',
   array['consumer','unfair practice','deceptive','misleading','faulty','refund','defective'], array['refund-letter','complaint-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31'),
  ('cpa-rescission', 'consumer-protection-act-2012', 'Unfair-practice remedies (see source for numbering)', 'Rescission and remedies after an unfair practice',
   'A consumer who enters an agreement after an unfair practice may rescind it and seek remedies available in law, including damages. Confirm the provision numbering in the source text.',
   'Remedies for unfair practices. Confirm numbering before citing.',
   array['rescind','cancel','damages','remedy','unfair practice'], array['refund-letter','complaint-letter','demand-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31'),
  ('cpa-quality', 'consumer-protection-act-2012', 'Consumer rights and supplier obligations (see source)', 'Quality, safety and description of goods and services',
   'Addresses goods and services that must be safe, of acceptable quality and as described, with repair, replacement or refund pathways. Confirm the operative sections in the source text.',
   'Substantive consumer-rights parts. Confirm section numbers before citing.',
   array['quality','safe','as described','warranty','guarantee','repair','replacement','goods','services'], array['refund-letter','complaint-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31'),
  ('loc-s1-title', 'law-of-contract-act', 'Section 1', 'Short title',
   'Citation provision for the Law of Contract Act.',
   'Preliminary.',
   array['contract','agreement'], array['service-agreement','loan-acknowledgement','tenancy-agreement','employment-contract'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31'),
  ('loc-s2-english-law', 'law-of-contract-act', 'Section 2', 'Application of English common law of contract',
   'Applies the English common law of contract in Kenya with modifications; contracts in writing are not void merely for want of a seal. Confirm the text in the source.',
   'Foundational contract provision.',
   array['contract','enforceable','seal','writing','signed','binding','loan','repayment'], array['service-agreement','loan-acknowledgement','tenancy-agreement','demand-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31'),
  ('rr-scope', 'rent-restriction-act', 'Scope of application (see source for numbering)', 'Application to dwelling-houses',
   'Applies to dwelling-houses other than excepted categories such as service tenancies. Confirm the operative section and current exceptions in the source text.',
   'Application provisions at the start of the Act.',
   array['dwelling','residential','rent restriction','standard rent','possession','premium','tenant','landlord','rent'], array['tenancy-agreement','rent-acknowledgement'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1959/35'),
  ('lt301-s2-controlled', 'landlord-tenant-shops-act', 'Section 2 (interpretation; see source)', 'Controlled tenancy — meaning',
   'Defines controlled tenancies of shops, hotels and catering establishments, covering unwritten tenancies and written tenancies within the statutory period. Confirm the definition in the source text.',
   'Interpretation section.',
   array['controlled tenancy','shop','hotel','catering','commercial premises','business premises'], array['tenancy-agreement'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31'),
  ('lt301-s4-notice', 'landlord-tenant-shops-act', 'Section 4 (termination notices; see source)', 'Termination notices for controlled tenancies',
   'Prescribes the notice procedure for terminating or altering a controlled tenancy, including minimum notice periods. Confirm the subsections in the source text.',
   'Termination and alteration provisions.',
   array['notice','termination of tenancy','eviction notice','two months notice','quit','vacate'], array['tenancy-agreement'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31'),
  ('lt301-s12-tribunal', 'landlord-tenant-shops-act', 'Section 12 (see source)', 'Powers of Tribunals',
   'Sets what the Tribunal may determine, including controlled-tenancy status and rent. Confirm the enumerations in the source text.',
   'Tribunal provisions.',
   array['tribunal','dispute','rent tribunal','business premises rent tribunal'], array['tenancy-agreement','complaint-letter'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31'),
  ('oaths-s2-commissioners', 'oaths-statutory-declarations-act', 'Section 2 (see source)', 'Appointment of commissioners for oaths',
   'Practising advocates may be appointed commissioners for oaths and may administer oaths and take affidavits anywhere in Kenya. Confirm the text in the source.',
   'Part II – Commissioners for oaths.',
   array['commissioner for oaths','advocate','swear','sworn','affidavit','oath'], array['affidavit'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26'),
  ('oaths-s5-jurat', 'oaths-statutory-declarations-act', 'Section 5 (see source)', 'Particulars in the jurat or attestation clause',
   'The commissioner must truly state in the jurat or attestation the place and date where the oath or affidavit is taken or made. Confirm the text in the source.',
   'Commissioner duties provisions.',
   array['jurat','attestation','place','date','stamp','commission'], array['affidavit'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26'),
  ('oaths-s11-penalty', 'oaths-statutory-declarations-act', 'Section 11 (see source)', 'Penalty for false declaration',
   'Prescribes penalties for false declarations. Confirm the offence and penalty text in the source.',
   'Offences and penalties.',
   array['false','perjury','false declaration','penalty','offence','truth'], array['affidavit'],
   'sourced-pending-fulltext-check', 'https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26')
on conflict (id) do nothing;
