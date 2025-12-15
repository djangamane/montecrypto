import Link from "next/link";

import { getPublishedPreviewPosts } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";
import { videos } from "@/src/lib/videos";

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

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-brand-text sm:text-5xl">
          AI Crypto Risk Blog
        </h1>
        <p className="mt-4 text-lg text-brand-muted">
          Latest investigations, risk analysis, and educational guides.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <section className="mb-20">
        <h2 className="mb-8 text-2xl font-semibold text-brand-text">Latest Articles</h2>
        {posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col overflow-hidden rounded-2xl border border-brand-muted/20 bg-white/5 transition hover:border-brand-muted/40 hover:bg-white/10">
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 text-sm text-brand-muted">
                    {post.publish_at ? new Date(post.publish_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Draft'}
                  </div>
                  <Link href={`/blog/${post.slug}`} className="mb-3 block">
                    <h3 className="text-xl font-semibold text-brand-text transition hover:text-brand-link">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-brand-muted line-clamp-3">
                    {post.summary}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-sm font-medium text-brand-link hover:text-brand-link/80">
                    Read article &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-brand-muted">No articles published yet.</p>
        )}
      </section>

      {/* Video Section */}
      <section>
        <h2 className="mb-8 text-2xl font-semibold text-brand-text">Video Analysis</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-2xl border border-brand-muted/20 bg-black"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg transition group-hover:scale-110">
                    <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-link">
                  {video.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">{new Date(video.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
