"use server";

import { revalidatePath } from "next/cache";

import { publishPreviewPost } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

export async function publishPostAction(id: string) {
  if (!id) {
    return { ok: false, error: "Missing id." };
  }

  if (!supabaseService) {
    const post = publishPreviewPost(id);
    if (!post) {
      return { ok: false, error: "Post not found." };
    }
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/blog/feed");
    return { ok: true, slug: post.slug };
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseService
    .from("posts")
    .update({ status: "published", publish_at: nowIso, updated_at: nowIso })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const slug = data?.slug ?? null;
  if (slug) {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog/feed");
    revalidatePath("/sitemap.xml");
  }

  return { ok: true, slug };
}
