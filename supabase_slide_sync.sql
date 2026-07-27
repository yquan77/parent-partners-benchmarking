-- Run once in the Supabase SQL editor for the live Malay companion page.
-- The table intentionally contains one public, non-sensitive row only.

create table if not exists public.current_slide (
  id integer primary key check (id = 1),
  slide_index integer not null default 0 check (slide_index between 0 and 45),
  updated_at timestamptz not null default now()
);

insert into public.current_slide (id, slide_index)
values (1, 0)
on conflict (id) do nothing;

alter table public.current_slide enable row level security;

grant select, update on public.current_slide to anon;

drop policy if exists "Anyone can read current slide" on public.current_slide;
create policy "Anyone can read current slide"
on public.current_slide
for select
to anon
using (id = 1);

drop policy if exists "Anyone can update current slide" on public.current_slide;
create policy "Anyone can update current slide"
on public.current_slide
for update
to anon
using (id = 1)
with check (id = 1);
