import { NextResponse, type NextRequest } from "next/server";

import { upsertPreviewPost } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";
import { toSlug } from "@/lib/slug";

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
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    idempotencyKey,
    status = "draft",
    title,
    slug,
    summary,
    keywords,
    category,
    publishAt,
    heroImageUrl,
    bodyFormat,
    body,
  } = payload ?? {};

  if (!title || !body || bodyFormat !== "markdown") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const finalSlug = slug ? toSlug(String(slug)) : toSlug(String(title));
  const kw = Array.isArray(keywords)
    ? keywords
    : typeof keywords === "string" && keywords.length
      ? keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

  if (!supabaseService) {
    const row = upsertPreviewPost({
      idempotencyKey: idempotencyKey ?? null,
      title,
      slug: finalSlug,
      summary: summary ?? null,
      category: category ?? null,
      keywords: kw,
      heroImageUrl: heroImageUrl ?? null,
      body,
      status,
      publishAt: publishAt ?? null,
    });

    console.warn("Supabase not configured: storing post in preview store.");
    return NextResponse.json({ ok: true, slug: row.slug }, { status: 201 });
  }

  const nowIso = new Date().toISOString();

  if (!idempotencyKey) {
    console.warn("Missing idempotencyKey. A new record will be inserted each time.");
  }

  const { data: existing, error: existingError } = await supabaseService
    .from("posts")
    .select("id, slug")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingError) {
    console.error("Supabase read error", existingError.message);
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const row = {
    idempotency_key: idempotencyKey ?? null,
    title,
    slug: finalSlug,
    summary: summary ?? null,
    category: category ?? null,
    keywords: kw,
    hero_image_url: heroImageUrl ?? null,
    body_md: body,
    status,
    publish_at: publishAt ?? null,
    updated_at: nowIso,
  };

  const mutation = existing
    ? supabaseService
        .from("posts")
        .update(row)
        .eq("id", existing.id)
        .select("slug")
        .single()
    : supabaseService
        .from("posts")
        .insert({ ...row, created_at: nowIso })
        .select("slug")
        .single();

  const { data, error } = await mutation;

  if (error) {
    console.error("Supabase write error", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: trigger ISR/cache revalidation here if needed.

  return NextResponse.json({ ok: true, slug: data?.slug ?? finalSlug }, { status: 201 });
}
