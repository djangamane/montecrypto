import { NextResponse } from "next/server";

import { listPreviewPosts } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

export async function GET() {
  if (!supabaseService) {
    return NextResponse.json({ posts: listPreviewPosts() });
  }

  const { data, error } = await supabaseService
    .from("posts")
    .select("id,title,status,publish_at,slug,summary")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase list error", error.message);
    return NextResponse.json({ error: error.message, posts: [] }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
