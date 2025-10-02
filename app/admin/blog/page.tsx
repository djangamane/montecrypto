"use client";

import { useState, useTransition } from "react";
import useSWR from "swr";

import { publishPostAction } from "./actions";

type AdminPost = {
  id: string;
  title: string;
  status: "draft" | "published";
  publish_at: string | null;
  slug?: string;
  summary?: string | null;
};

type ListResponse = {
  posts?: AdminPost[];
  error?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<ListResponse>);

export default function AdminBlogPage() {
  const { data, isLoading, mutate } = useSWR<ListResponse>("/api/admin/blog.list", fetcher);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const posts = data?.posts ?? [];

  function handlePublish(id: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await publishPostAction(id);
      if (!result.ok) {
        setMessage(result.error ?? "Failed to publish post.");
        return;
      }
      await mutate();
      setMessage(`Published → /blog/${result.slug ?? ""}`.trim());
    });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Admin · Blog</h1>

      {message && <p className="mb-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p>}

      {isLoading ? (
        <p className="text-brand-muted">Loading posts…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-muted/20 bg-white shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-bg/60 text-brand-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Publish at</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const publishDate = post.publish_at ? new Date(post.publish_at).toLocaleString() : "—";
                const isDraft = post.status === "draft";
                return (
                  <tr key={post.id} className="border-t border-brand-muted/10">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-text">{post.title}</div>
                      {post.summary && <div className="text-xs text-brand-muted">{post.summary}</div>}
                    </td>
                    <td className="px-4 py-3 capitalize">{post.status}</td>
                    <td className="px-4 py-3 text-brand-muted">{publishDate}</td>
                    <td className="px-4 py-3 text-right">
                      {isDraft ? (
                        <button
                          type="button"
                          onClick={() => handlePublish(post.id)}
                          disabled={isPending}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                        >
                          {isPending ? "Publishing…" : "Publish"}
                        </button>
                      ) : (
                        <span className="text-xs uppercase tracking-wide text-emerald-600">Published</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!posts.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-brand-muted">
                    No posts yet. Ingest content from Make to see drafts here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
