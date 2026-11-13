-- FAQ content: published entries are publicly readable;
-- the admin account has full CRUD (including unpublished drafts).

create table if not exists public.faq_entries (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  position int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faq_entries enable row level security;

create policy "faq_public_read" on public.faq_entries
  for select using (published = true);
create policy "faq_admin_all" on public.faq_entries
  for all using ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'michaelkariuki281@gmail.com');

insert into public.faq_entries (question, answer, category, position) values
  ('Is HAKI AI a law firm?', 'No. HAKI AI provides general legal information and document-drafting assistance only. It does not provide legal advice or create a lawyer-client relationship. For serious matters, consult a licensed Advocate of the High Court of Kenya.', 'General', 1),
  ('How much does HAKI AI cost?', 'HAKI AI is free to use. You can ask legal questions, scan contracts, and generate documents without paying anything.', 'General', 2),
  ('Which documents can I generate?', 'Ten templates: demand letter, rent acknowledgement, service agreement, loan acknowledgement, complaint letter, refund letter, tenancy agreement, employment contract, affidavit, and salary/final-pay claim.', 'Documents', 3),
  ('Are my documents stored on the server?', 'No. Only document metadata and form fields are saved to your account so you can resume drafts. The full document text is generated in your browser and never stored on the server.', 'Privacy', 4),
  ('Which languages are supported?', 'Answers and interfaces are available in English and Kiswahili using the EN / SW toggle in the header.', 'General', 5),
  ('How accurate are the answers?', 'Answers are grounded to a curated repository of Kenyan Acts — such as the Employment Act, Land Act and Consumer Protection Act — with links to official Kenya Law sources. They remain general information, not legal advice.', 'General', 6);
