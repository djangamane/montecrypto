import { notFound } from "next/navigation";
import { marked } from "marked";
import Link from "next/link";

import { getPreviewPostBySlug } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";

interface BlogPost {
  title: string;
  slug: string;
  body_md: string;
  summary: string | null;
  hero_image_url: string | null;
  publish_at: string | null;
}

export const revalidate = 300;

type PageParams = {
  params: { slug: string };
};

async function fetchPost(slug: string): Promise<BlogPost | null> {
  if (!supabaseService) {
    const preview = getPreviewPostBySlug(slug);
    if (!preview || preview.status !== "published") {
      return null;
    }
    return preview;
  }

  const { data, error } = await supabaseService
    .from("posts")
    .select("title, slug, body_md, summary, hero_image_url, publish_at, status")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("publish_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Blog detail fetch error", error.message);
    return null;
  }

  return data ?? null;
}

export default async function BlogPostPage({ params }: PageParams) {
  const post = await fetchPost(params.slug);

  if (!post) {
    notFound();
  }

  // Remove the first H1 from the markdown if it exists, to avoid duplication with the template title
  const cleanBody = (post.body_md ?? "").replace(/^#\s+.+$/m, "");
  const html = marked.parse(cleanBody);
  const date = post.publish_at ? new Date(post.publish_at) : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/" className="text-brand-muted hover:text-brand-text" aria-label="Home">
          Home
        </Link>
        <span className="text-brand-muted">/</span>
        <Link href="/blog" className="text-brand-muted hover:text-brand-text">
          Blog
        </Link>
        <span className="text-brand-muted">/</span>
        <span className="text-brand-text truncate max-w-[200px]">{post.title}</span>
      </nav>

      <article className="prose prose-lg prose-slate">
        <h1>{post.title}</h1>
      {date && (
        <p className="text-sm text-brand-muted">
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
      {post.hero_image_url && (
        <img
          src={post.hero_image_url}
          alt={post.title}
          className="my-6 w-full rounded-xl"
        />
      )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <hr className="my-10 border-brand-muted/20" />

      {/* Call to Action */}
      <p className="text-brand-muted">
        Before you buy anything, <a href="/#scanner" className="text-brand-link hover:underline">run a risk scan</a> or start the{" "}
        <a href="/#course" className="text-brand-link hover:underline">free course</a>.
      </p>

      {/* Financial Disclaimer */}
      <div className="mt-8 rounded-lg border border-brand-muted/20 bg-brand-muted/5 p-4 text-xs text-brand-muted">
        <p className="font-semibold mb-1">Disclaimer</p>
        <p>
          This content is for educational and informational purposes only. It is not financial, investment,
          or trading advice. Always do your own research (DYOR) before making any investment decisions.
          Cryptocurrency investments are highly volatile and may result in significant losses.
        </p>
      </div>

      {/* Back to Blog */}
      <div className="mt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-link hover:text-brand-text"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>
      </div>
    </main>
  );
}
