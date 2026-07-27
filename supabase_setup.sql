-- Benchmarking slot 星星评分表
create table if not exists confidence_ratings (
  id bigint generated always as identity primary key,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table confidence_ratings enable row level security;

-- 允许任何人（包括匿名访客）新增一笔评分
create policy "anyone can insert a rating"
  on confidence_ratings for insert
  to anon
  with check (true);

-- 允许任何人读取（用来算平均分、显示即时结果），但不能改/删
create policy "anyone can read ratings"
  on confidence_ratings for select
  to anon
  using (true);

-- 明确不开放 update / delete 给 anon（不建policy即代表默认拒绝，此处仅作说明）
