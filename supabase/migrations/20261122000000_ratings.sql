create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 500),
  page text not null default '/',
  created_at timestamptz not null default now()
);

create index if not exists ratings_created_at_idx
  on public.ratings (created_at desc);

alter table public.ratings enable row level security;

drop policy if exists "ratings_insert" on public.ratings;
create policy "ratings_insert" on public.ratings
  for insert with check (user_id is null or auth.uid() = user_id);

drop policy if exists "ratings_admin_all" on public.ratings;
create policy "ratings_admin_all" on public.ratings
  for all using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');
