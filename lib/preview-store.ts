export type PostStatus = "draft" | "published";

export interface PreviewPostRow {
  id: string;
  idempotency_key: string | null;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  keywords: string[];
  hero_image_url: string | null;
  body_md: string;
  status: PostStatus;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UpsertInput {
  idempotencyKey: string | null;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  keywords: string[];
  heroImageUrl: string | null;
  body: string;
  status: PostStatus;
  publishAt: string | null;
}

interface PreviewStore {
  postsById: Map<string, PreviewPostRow>;
  idByIdempotency: Map<string, string>;
}

type GlobalWithPreviewStore = typeof globalThis & {
  __previewPostsStore?: PreviewStore;
};

function getStore(): PreviewStore {
  const globalWithStore = globalThis as GlobalWithPreviewStore;
  if (!globalWithStore.__previewPostsStore) {
    globalWithStore.__previewPostsStore = {
      postsById: new Map(),
      idByIdempotency: new Map(),
    };
  }
  return globalWithStore.__previewPostsStore;
}

function ensureId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function upsertPreviewPost(input: UpsertInput) {
  const store = getStore();
  const now = new Date().toISOString();
  const { idempotencyKey } = input;

  let existingId: string | undefined;
  if (idempotencyKey) {
    existingId = store.idByIdempotency.get(idempotencyKey) ?? undefined;
  }

  if (existingId) {
    const existing = store.postsById.get(existingId);
    if (existing) {
      const updated: PreviewPostRow = {
        ...existing,
        title: input.title,
        slug: input.slug,
        summary: input.summary,
        category: input.category,
        keywords: input.keywords,
        hero_image_url: input.heroImageUrl,
        body_md: input.body,
        status: input.status,
        publish_at: input.publishAt,
        updated_at: now,
      };
      store.postsById.set(existingId, updated);
      return updated;
    }
  }

  const id = ensureId();
  const row: PreviewPostRow = {
    id,
    idempotency_key: idempotencyKey,
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    category: input.category,
    keywords: input.keywords,
    hero_image_url: input.heroImageUrl,
    body_md: input.body,
    status: input.status,
    publish_at: input.publishAt,
    created_at: now,
    updated_at: now,
  };

  store.postsById.set(id, row);
  if (idempotencyKey) {
    store.idByIdempotency.set(idempotencyKey, id);
  }
  return row;
}

export function listPreviewPosts() {
  const store = getStore();
  return Array.from(store.postsById.values()).sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  );
}

export function publishPreviewPost(id: string) {
  const store = getStore();
  const existing = store.postsById.get(id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const updated: PreviewPostRow = {
    ...existing,
    status: "published",
    publish_at: now,
    updated_at: now,
  };
  store.postsById.set(id, updated);
  return updated;
}

export function getPreviewPostBySlug(slug: string) {
  const store = getStore();
  return Array.from(store.postsById.values()).find((p) => p.slug === slug) ?? null;
}

export function getPublishedPreviewPosts(limit?: number) {
  const posts = listPreviewPosts().filter(
    (post) =>
      post.status === "published" &&
      (!post.publish_at || new Date(post.publish_at) <= new Date()),
  );
  return typeof limit === "number" ? posts.slice(0, limit) : posts;
}
