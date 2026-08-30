import { createHash } from "crypto";

/** X-Forwarded-For / X-Real-IP からクライアントIPを取り出す（Vercel想定）。 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** 生IPは保存しない。ソルト付きハッシュの先頭16文字を識別子として使う。 */
export function ipHash(ip: string): string {
  const salt =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.ANTHROPIC_API_KEY ??
    "gyosei";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}
