import { formatAdminDate } from "@/lib/adminPresentation";

export function AdminDetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-px overflow-hidden rounded-lg border border-ax-border-subtle bg-ax-border-subtle sm:grid-cols-2">{children}</dl>;
}

export function AdminDetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-ax-ink-1 px-5 py-4">
      <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-ax-text-muted">{label}</dt>
      <dd className="break-words text-sm leading-relaxed text-ax-text-primary">{children}</dd>
    </div>
  );
}

export function AdminTimestamp({ value }: { value: Date | null }) {
  if (!value) return <>Not recorded</>;
  return <time dateTime={value.toISOString()}>{formatAdminDate(value)}</time>;
}
