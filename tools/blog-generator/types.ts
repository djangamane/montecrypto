export interface BlogInput {
  title: string;
  category: string;
  keywords: string;
  summary: string;
  slug?: string;
  publishDate?: string;
  hero_image_url?: string;
  idempotency_key?: string;
}

export interface SupabasePayload {
  idempotency_key: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  keywords: string[];
  hero_image_url: string | null;
  body_md: string;
  status: 'draft';
  publish_at: string | null;
  created_at: string;
  updated_at: string;
}
