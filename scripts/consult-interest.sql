-- 「行政書士に相談したい」ボタンの需要計測テーブル。
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行する。
-- 個人情報は保存しない（source と context と ip_hash のみ）。
-- RLS 有効・ポリシーなし＝ anon からはアクセス不可。書き込みは /api/interest が service_role で行う。

create table if not exists public.consult_interest (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  source      text not null,   -- 'diagnosis' | 'chat' | 'article'
  context     text,            -- 'risk:高' / 質問文 / 記事スラッグ など
  ip_hash     text
);

create index if not exists consult_interest_created_at_idx
  on public.consult_interest (created_at desc);

alter table public.consult_interest enable row level security;
