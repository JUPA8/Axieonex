import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDetailField, AdminDetailGrid, AdminTimestamp } from "@/components/admin/AdminDetailFields";
import { ProviderStateDisplay } from "@/components/admin/ProviderStateDisplay";
import { getAdminContact } from "@/lib/adminData";
import { adminDashboardHref, parseAdminPage } from "@/lib/adminPagination";

export const metadata: Metadata = {
  title: "Contact submission | AXIEONEX Admin",
  robots: { index: false, follow: false },
};

export default async function AdminContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ contactsPage?: string | string[]; bookingsPage?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const contact = await getAdminContact(id);
  if (!contact) notFound();
  const backHref = adminDashboardHref(parseAdminPage(query.contactsPage), parseAdminPage(query.bookingsPage));

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={backHref} className="mb-6 inline-flex min-h-11 items-center text-sm text-ax-cyan-alt hover:underline">
        Back to submissions
      </Link>
      <h1 className="text-2xl font-bold">Contact submission</h1>
      <p className="mb-8 mt-2 break-words text-ax-text-muted">Submitted by {contact.name}</p>

      <AdminDetailGrid>
        <AdminDetailField label="Purpose">{contact.purpose}</AdminDetailField>
        <AdminDetailField label="Name">{contact.name}</AdminDetailField>
        <AdminDetailField label="Email">
          <span className="break-all">{contact.email}</span>
        </AdminDetailField>
        <AdminDetailField label="Company">{contact.company ?? "Not provided"}</AdminDetailField>
        <AdminDetailField label="Created">
          <AdminTimestamp value={contact.createdAt} />
        </AdminDetailField>
        <AdminDetailField label="Updated">
          <AdminTimestamp value={contact.updatedAt} />
        </AdminDetailField>
      </AdminDetailGrid>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Message</h2>
        <p className="whitespace-pre-wrap break-words rounded-lg border border-ax-border-subtle bg-white/[0.02] p-5 text-sm leading-relaxed">
          {contact.message}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Provider status</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-ax-border-subtle p-5">
            <h3 className="mb-3 font-semibold">Email notification</h3>
            <ProviderStateDisplay state={contact.emailState} stateUpdatedAt={contact.emailStateUpdatedAt} successAt={contact.emailSentAt} />
          </div>
          <div className="rounded-lg border border-ax-border-subtle p-5">
            <h3 className="mb-3 font-semibold">CRM synchronization</h3>
            <ProviderStateDisplay state={contact.crmState} stateUpdatedAt={contact.crmStateUpdatedAt} successAt={contact.crmSyncedAt} />
          </div>
        </div>
      </section>
    </div>
  );
}
