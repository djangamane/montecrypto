import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const BUILD_DIR = path.join(process.cwd(), 'public', 'tools', 'blog-generator');
const ENTRY_PATH = path.join(BUILD_DIR, 'index.html');

export default function BlogGeneratorToolPage() {
  const hasBuild = fs.existsSync(ENTRY_PATH);
  let cacheBuster: string | null = null;

  if (hasBuild) {
    try {
      cacheBuster = Math.floor(fs.statSync(ENTRY_PATH).mtimeMs).toString(36);
    } catch (error) {
      console.warn('Unable to stat blog generator build:', error);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Admin</p>
        <h1 className="text-3xl font-heading uppercase text-brand-text">Blog Generator</h1>
        <p className="text-sm text-brand-muted">
          Run the Gemini-assisted generator, then paste the Supabase payload into the ingest endpoint or SQL editor to stage drafts.
        </p>
      </header>

      {!hasBuild ? (
        <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-6 py-5 text-sm text-amber-900">
          <p className="font-semibold">Static build not found.</p>
          <p className="mt-2">
            Run <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">npm run build:blog-tool</code> to compile the generator into
            <code className="ml-1 rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">public/tools/blog-generator/</code>, then reload this page.
          </p>
        </div>
      ) : (
        <iframe
          title="AI Crypto Risk Blog Generator"
          src={`/tools/blog-generator/index.html${cacheBuster ? `?v=${cacheBuster}` : ''}`}
          className="mt-6 h-[80vh] w-full overflow-hidden rounded-2xl border border-brand-muted/30 shadow-xl"
        />
      )}

      <section className="mt-8 space-y-3 text-sm text-brand-muted">
        <p>
          The generator writes drafts with idempotency keys, Markdown, and a ready cURL command. Use the command with
          <code className="ml-1 rounded bg-brand-bg px-1 py-0.5 font-mono text-xs">INGEST_API_KEY</code> to insert directly via <span className="font-mono">/api/admin/blog.ingest</span>.
        </p>
        <p>
          Alternately, paste the JSON into the Supabase SQL editor so it appears in <span className="font-mono">/admin/blog</span>, then publish when ready.
        </p>
      </section>
    </main>
  );
}
