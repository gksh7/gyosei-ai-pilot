import { createClient } from "@supabase/supabase-js";

/**
 * サーバー専用の Supabase クライアント（service_role キー・RLSバイパス）。
 * 絶対にクライアントコンポーネントから import しないこと。
 * SUPABASE_SERVICE_ROLE_KEY が未設定の環境では null になり、呼び出し側で no-op にする。
 */

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdmin =
  url && serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : null;
