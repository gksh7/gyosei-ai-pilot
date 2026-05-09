import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json() as { articleId?: string };
    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("analytics")
      .select("id, page_views")
      .eq("article_id", articleId)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("analytics")
        .update({ page_views: existing.page_views + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("analytics")
        .insert({ article_id: articleId, date: today, page_views: 1, clicks: 0, affiliate_clicks: 0 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
