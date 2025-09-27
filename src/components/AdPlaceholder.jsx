export function AdPlaceholder({ label }) {
  return (
    <div className="my-16 px-6">
      <div className="mx-auto flex h-28 max-w-4xl items-center justify-center rounded-2xl border border-dashed border-brand-muted/40 bg-white/70 text-sm text-brand-muted">
        {label}
      </div>
    </div>
  );
}
