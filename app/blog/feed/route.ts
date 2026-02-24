import { NextResponse } from "next/server";

import { getPublishedPreviewPosts } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aicryptorisk.com";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let posts:
    | Array<{ title: string; slug: string; summary: string | null; publish_at: string | null }>
    | null = null;

  if (!supabaseService) {
    posts = getPublishedPreviewPosts(50);
  } else {
    try {
      const [{ data: postsData }, { data: newsData }] = await Promise.all([
        supabaseService
          .from("posts")
          .select("title, slug, summary, publish_at")
          .eq("status", "published")
          .lte("publish_at", new Date().toISOString())
          .order("publish_at", { ascending: false })
          .limit(25),
        supabaseService
          .from("newsletters")
          .select("headline, id, summary, published_at")
          .eq("status", "published")
          .lte("published_at", new Date().toISOString())
          .order("published_at", { ascending: false })
          .limit(25)
      ]);

      const combined = [
        ...(postsData || []).map(p => ({ ...p })),
        ...(newsData || []).map(n => ({
          title: n.headline,
          slug: n.id,
          summary: n.summary,
          publish_at: n.published_at
        }))
      ];

      posts = combined.sort((a, b) =>
        new Date(b.publish_at || 0).getTime() - new Date(a.publish_at || 0).getTime()
      ).slice(0, 50);
    } catch (error) {
      console.error("RSS feed fetch error", error);
      posts = [];
    }
  }

  const items = (posts ?? []).map((post) => {
    const date = post.publish_at ? new Date(post.publish_at).toUTCString() : new Date().toUTCString();
    const description = post.summary ? escapeXml(post.summary) : "";
    return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${SITE_URL}/blog/${post.slug}</link>
        <guid>${SITE_URL}/blog/${post.slug}</guid>
        <pubDate>${date}</pubDate>
        <description>${description}</description>
      </item>
    `;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>AI Crypto Risk Blog</title>
      <link>${SITE_URL}/blog</link>
      <description>Daily red flags, risk signals, and how to avoid getting burned.</description>
      ${items.join("\n")}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate",
    },
  });
}
