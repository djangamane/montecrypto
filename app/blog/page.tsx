"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowLeft, Play, Clock, ChevronRight } from "lucide-react";
import { getPublishedPreviewPosts } from "@/lib/preview-store";
import { supabaseService } from "@/lib/supabase";
import { videos } from "@/src/lib/videos";

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadPosts() {
      let data: any[] = [];
      if (!supabaseService) {
        data = getPublishedPreviewPosts().map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          publish_at: post.publish_at,
        }));
      } else {
        const { data: fetchResult, error } = await supabaseService
          .from("posts")
          .select("id, title, slug, summary, publish_at, status")
          .eq("status", "published")
          .lte("publish_at", new Date().toISOString())
          .order("publish_at", { ascending: false });

        if (error) {
          console.error("Blog list fetch error", error.message);
        } else if (fetchResult) {
          data = fetchResult.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            publish_at: post.publish_at,
          }));
        }
      }
      setPosts(data);
    }

    loadPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(".reveal-item", {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [posts]);

  return (
    <main ref={pageRef} className="min-h-screen bg-brand-primary pb-24 pt-32 px-6 md:px-20">
      {/* Navigation */}
      <nav className="reveal-item mb-16 flex items-center justify-between">
        <Link
          href="/"
          className="btn-magnetic flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Terminal
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/api-keys" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            API Keys
          </Link>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Archive Online</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="reveal-item mb-24 max-w-4xl space-y-6">
        <h1 className="text-5xl font-extrabold uppercase tracking-tight text-white md:text-7xl lg:text-8xl flex flex-col">
          <span>Risk</span>
          <span className="font-drama italic text-brand-accent -mt-2 md:-mt-4">Intelligence Archive.</span>
        </h1>
        <p className="max-w-xl text-xl leading-relaxed text-white/40">
          Cinematic investigations, deep-dive risk analysis, and strategic briefings from the front lines of the crypto market.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <section className="mb-32">
        <div className="reveal-item mb-12 flex items-center justify-between border-b border-white/10 pb-6">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Latest Briefings</h2>
          <span className="text-xs font-bold text-brand-accent">{posts.length} entries</span>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="reveal-item group flex flex-col">
                <div className="mb-6 aspect-[16/10] overflow-hidden rounded-premium bg-white/5 border border-white/5 transition-all group-hover:border-white/20">
                  {/* Decorative placeholder for post image if missing */}
                  <div className="h-full w-full bg-gradient-to-br from-brand-accent/5 to-transparent flex items-center justify-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
                    <Shield className="h-24 w-24 text-brand-accent/10" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="mb-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {post.publish_at ? new Date(post.publish_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Draft'}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <span>Investigative Report</span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="mb-4 block">
                    <h3 className="text-2xl font-bold leading-tight text-white transition-colors group-hover:text-brand-accent md:text-3xl">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="mb-8 flex-1 text-sm leading-relaxed text-white/40 line-clamp-3">
                    {post.summary}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="btn-magnetic inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                  >
                    Load Full Protocol
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="reveal-item py-12 text-center text-white/20 font-data">
            &gt; NO PUBLISHED PROTOCOLS FOUND IN ARCHIVE.
          </div>
        )}
      </section>

      {/* Video Section */}
      <section>
        <div className="reveal-item mb-12 flex items-center justify-between border-b border-white/10 pb-6">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Visual Signal Analysis</h2>
          <span className="text-xs font-bold text-brand-accent">Telemetry</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal-item group relative block overflow-hidden rounded-premium border border-white/5 bg-black"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105 group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center transition group-hover:bg-black/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-primary shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-accent">
                    <Play className="ml-1 h-6 w-6 fill-current" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-accent mb-2">Video Intel</div>
                <h3 className="text-2xl font-bold text-white group-hover:text-brand-accent transition-colors">
                  {video.title}
                </h3>
                <div className="mt-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  <span>{new Date(video.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>Verified Stream</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

// Minimal Shield icon for the article cards since lucide-react Shield might not be imported in scope or we want a custom look
function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
