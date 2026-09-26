import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDetailField, AdminDetailGrid, AdminTimestamp } from "@/components/admin/AdminDetailFields";
import { ProviderStateDisplay } from "@/components/admin/ProviderStateDisplay";
import { getAdminBooking } from "@/lib/adminData";
import { adminDashboardHref, parseAdminPage } from "@/lib/adminPagination";
import { calendlyStatePresentation } from "@/lib/adminPresentation";

export const metadata: Metadata = {
  title: "Booking request | AXIEONEX Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ contactsPage?: string | string[]; bookingsPage?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const booking = await getAdminBooking(id);
  if (!booking) notFound();
  const backHref = adminDashboardHref(parseAdminPage(query.contactsPage), parseAdminPage(query.bookingsPage));
  const calendly = calendlyStatePresentation({
    status: booking.status,
    hasCorrelation: booking.hasCalendarCorrelation,
    confirmedAt: booking.confirmedAt,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={backHref} className="mb-6 inline-flex min-h-11 items-center text-sm text-ax-cyan-alt hover:underline">
        Back to submissions
      </Link>
      <h1 className="text-2xl font-bold">Strategy call request</h1>
      <p className="mb-8 mt-2 break-words text-ax-text-muted">Submitted by {booking.name}</p>

      <AdminDetailGrid>
        <AdminDetailField label="Status">{booking.status}</AdminDetailField>
        <AdminDetailField label="Name">{booking.name}</AdminDetailField>
        <AdminDetailField label="Email">
          <span className="break-all">{booking.email}</span>
        </AdminDetailField>
        <AdminDetailField label="Phone">{booking.phone}</AdminDetailField>
        <AdminDetailField label="Role">{booking.role}</AdminDetailField>
        <AdminDetailField label="Company">{booking.company}</AdminDetailField>
        <AdminDetailField label="Website">
          <span className="break-all">{booking.website}</span>
        </AdminDetailField>
        <AdminDetailField label="Country">{booking.country}</AdminDetailField>
        <AdminDetailField label="Company size">{booking.size}</AdminDetailField>
        <AdminDetailField label="Engagement range">{booking.budget}</AdminDetailField>
        <AdminDetailField label="Created">
          <AdminTimestamp value={booking.createdAt} />
        </AdminDetailField>
        <AdminDetailField label="Updated">
          <AdminTimestamp value={booking.updatedAt} />
        </AdminDetailField>
      </AdminDetailGrid>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Request context</h2>
        <AdminDetailGrid>
          <AdminDetailField label="Current outbound approach">{booking.approach}</AdminDetailField>
          <AdminDetailField label="Desired outcome">{booking.outcome}</AdminDetailField>
          <AdminDetailField label="Target market">{booking.market}</AdminDetailField>
          <AdminDetailField label="Requested slot label">{booking.slotLabel}</AdminDetailField>
          <AdminDetailField label="Requested slot value">
            <span className="break-all">{booking.slotId}</span>
          </AdminDetailField>
        </AdminDetailGrid>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Calendly verification</h2>
        <div className="rounded-lg border border-ax-border-subtle p-5">
          <p className="font-semibold">{calendly.label}</p>
          <p className="mt-1 text-sm text-ax-text-muted">{calendly.description}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ax-text-muted">Correlation record</dt>
              <dd>{booking.hasCalendarCorrelation ? "Recorded" : "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-ax-text-muted">Verified invitee record</dt>
              <dd>{booking.hasCalendarInvitee ? "Recorded" : "Not recorded"}</dd>
            </div>
            <div>
              <dt className="text-ax-text-muted">Confirmed</dt>
              <dd>
                <AdminTimestamp value={booking.confirmedAt} />
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-ax-text-muted">Calendly event reference</dt>
              <dd className="break-all">{booking.calendarBookingUid ?? "Not recorded"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Provider status</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-ax-border-subtle p-5">
            <h3 className="mb-3 font-semibold">Email notification</h3>
            <ProviderStateDisplay state={booking.emailState} stateUpdatedAt={booking.emailStateUpdatedAt} successAt={booking.emailSentAt} />
          </div>
          <div className="rounded-lg border border-ax-border-subtle p-5">
            <h3 className="mb-3 font-semibold">CRM synchronization</h3>
            <ProviderStateDisplay state={booking.crmState} stateUpdatedAt={booking.crmStateUpdatedAt} successAt={booking.crmSyncedAt} />
          </div>
        </div>
      </section>
    </div>
  );
}
