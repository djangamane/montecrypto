import { NextResponse, type NextRequest } from "next/server";

import { publishPreviewPost } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

const API_KEY = process.env.INGEST_API_KEY;

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    console.error("INGEST_API_KEY is not configured.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Bearer ${API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = payload?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!supabaseService) {
    const post = publishPreviewPost(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.warn("Supabase not configured: toggled preview post to published.");
    return NextResponse.json({ ok: true, slug: post.slug }, { status: 200 });
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseService
    .from("posts")
    .update({ status: "published", publish_at: nowIso, updated_at: nowIso })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("Supabase publish error", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.slug) {
    return NextResponse.json({ error: "Post not found or already published" }, { status: 404 });
  }

  // TODO: trigger revalidation if using cache tags.

  return NextResponse.json({ ok: true, slug: data.slug }, { status: 200 });
}
