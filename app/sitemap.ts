import type { MetadataRoute } from "next";

import { getPublishedPreviewPosts } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aicryptorisk.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/blog`, lastModified: new Date() },
  ];

  if (!supabaseService) {
    getPublishedPreviewPosts().forEach((post) => {
      urls.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      });
    });
    return urls;
  }

  const { data, error } = await supabaseService
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .lte("publish_at", new Date().toISOString());

  if (error) {
    console.error("Sitemap fetch error", error.message);
    return urls;
  }

  (data ?? []).forEach((post) => {
    urls.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    });
  });

  return urls;
}
