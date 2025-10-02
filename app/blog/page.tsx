import Link from "next/link";

import { getPublishedPreviewPosts } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  publish_at: string | null;
};

export const revalidate = 300;

async function fetchPosts(): Promise<BlogListItem[]> {
  if (!supabaseService) {
    return getPublishedPreviewPosts().map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      publish_at: post.publish_at,
    }));
  }

  const { data, error } = await supabaseService
    .from("posts")
    .select("id, title, slug, summary, publish_at, status")
    .eq("status", "published")
    .lte("publish_at", new Date().toISOString())
    .order("publish_at", { ascending: false });

  if (error) {
    console.error("Blog list fetch error", error.message);
    return [];
  }

  return (data ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    publish_at: post.publish_at,
  }));
}

export default async function BlogIndexPage() {
  const posts = await fetchPosts();

  if (!posts.length) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold">AI Crypto Risk Blog</h1>
        <p className="mt-4 text-brand-muted">
          Coming soon. Check back once the first batch of investigations are published.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">AI Crypto Risk Blog</h1>
      <ul className="space-y-6">
        {posts.map((post) => {
          const date = post.publish_at ? new Date(post.publish_at) : null;
          return (
            <li key={post.id} className="border-b border-brand-muted/20 pb-6 last:border-none">
              <Link href={`/blog/${post.slug}`} className="text-xl font-semibold text-brand-text hover:text-brand-link">
                {post.title}
              </Link>
              {date && (
                <div className="mt-1 text-sm text-brand-muted">
                  {date.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
              {post.summary && <p className="mt-2 text-brand-muted">{post.summary}</p>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
