-- チャットボットの質問ログ用テーブル。
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行する。
-- RLS を有効にしポリシーを作らないので、anon からは一切アクセス不可。
-- 書き込みは API ルート（/api/chat）が service_role キーで行う（RLSバイパス）。

create table if not exists public.chat_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  question    text not null,
  answer      text,
  turn_count  int,
  ip_hash     text
);

create index if not exists chat_logs_created_at_idx
  on public.chat_logs (created_at desc);

alter table public.chat_logs enable row level security;
