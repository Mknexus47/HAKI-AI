-- HAKI AI — MVP schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- ============================================================
-- 2. Save & Resume drafts (document_requests)
-- ============================================================
create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  doc_type text not null,
  form_data jsonb not null default '{}'::jsonb,
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, doc_type)
);

-- ============================================================
-- 4. Document history (metadata only — NEVER full document text)
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  doc_type text not null,
  title text not null,
  status text not null default 'Generated',
  form_data jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. Feedback ("Was this helpful?")
-- ============================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  context text not null,
  helpful boolean not null,
  reason text,
  comment text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. Admin moderation queue
-- ============================================================
create table if not exists public.flagged_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  reason text not null,
  snippet text,
  flag_count int not null default 1,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.document_requests enable row level security;
alter table public.documents enable row level security;
alter table public.feedback enable row level security;
alter table public.flagged_sessions enable row level security;

-- document_requests: owner only
create policy "drafts_select_own" on public.document_requests
  for select using (auth.uid() = user_id);
create policy "drafts_insert_own" on public.document_requests
  for insert with check (auth.uid() = user_id);
create policy "drafts_update_own" on public.document_requests
  for update using (auth.uid() = user_id);
create policy "drafts_delete_own" on public.document_requests
  for delete using (auth.uid() = user_id);

-- documents: owner + admin
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);
create policy "documents_admin" on public.documents
  for select using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');

-- feedback: anyone logged in can insert their own; anonymous inserts allowed
create policy "feedback_insert" on public.feedback
  for insert with check (user_id is null or auth.uid() = user_id);
create policy "feedback_admin" on public.feedback
  for select using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');

-- flagged_sessions: clients can only flag themselves/anonymous; admin reviews
create policy "flag_insert" on public.flagged_sessions
  for insert with check (user_id is null or auth.uid() = user_id);
create policy "flag_admin_select" on public.flagged_sessions
  for select using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
create policy "flag_admin_update" on public.flagged_sessions
  for update using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
create policy "flag_admin_delete" on public.flagged_sessions
  for delete using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
