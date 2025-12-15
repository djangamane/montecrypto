import { notFound } from "next/navigation";
import { marked } from "marked";

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
    <main className="prose prose-lg prose-slate mx-auto max-w-2xl px-4 py-10">
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
      <hr className="my-10" />
      <p>
        Before you buy anything, <a href="/#scanner">run a risk scan</a> or start the
        <a href="/#course"> free course</a>.
      </p>
    </main>
  );
}
