export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
      <h1 className="text-2xl font-bold">Loading administration data</h1>
      <p className="text-ax-text-muted">Please wait while the protected records are loaded.</p>
      <div aria-hidden="true" className="h-40 animate-pulse rounded-lg border border-ax-border-subtle bg-white/[0.02] motion-reduce:animate-none" />
    </div>
  );
}
