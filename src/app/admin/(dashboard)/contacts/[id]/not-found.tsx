import Link from "next/link";

export default function ContactNotFound() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-2xl font-bold">Contact submission not found</h1>
      <p className="mt-3 text-ax-text-muted">The requested contact submission does not exist or is no longer available.</p>
      <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center text-ax-cyan-alt hover:underline">
        Back to submissions
      </Link>
    </div>
  );
}
