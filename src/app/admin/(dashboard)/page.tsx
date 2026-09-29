import type { Metadata } from "next";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { getAdminSubmissions } from "@/lib/adminData";
import { adminDetailHref, parseAdminPage } from "@/lib/adminPagination";
import { calendlyStatePresentation, formatAdminDate, providerStatePresentation } from "@/lib/adminPresentation";

export const metadata: Metadata = {
  title: "Admin | AXIEONEX",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ contactsPage?: string | string[]; bookingsPage?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedContactPage = parseAdminPage(query.contactsPage);
  const requestedBookingPage = parseAdminPage(query.bookingsPage);
  const { contacts, bookings, contactPagination, bookingPagination } = await getAdminSubmissions(
    requestedContactPage,
    requestedBookingPage,
  );

  return (
    <div className="flex flex-col gap-12">
      <h1 className="sr-only">Admin dashboard</h1>
      <section>
        <h2 className="mb-1 text-xl font-bold">Contact submissions</h2>
        <p className="mb-5 text-sm text-ax-text-muted">Newest submissions first. Times are shown in UTC.</p>
        <div className="overflow-x-auto rounded-lg border border-ax-border-subtle">
          <table className="w-full min-w-[1160px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ax-border-subtle bg-white/[0.02]">
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Email notification</th>
                <th className="px-4 py-3 font-semibold">CRM sync</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-ax-text-muted">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                contacts.map((row) => (
                  <tr key={row.id} className="border-b border-ax-border-subtle last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-ax-text-muted">{formatAdminDate(row.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ax-text-muted">{formatAdminDate(row.updatedAt)}</td>
                    <td className="px-4 py-3">{row.purpose}</td>
                    <td className="max-w-[220px] break-words px-4 py-3">{row.name}</td>
                    <td className="max-w-[260px] break-all px-4 py-3">{row.email}</td>
                    <td className="max-w-[320px] truncate px-4 py-3" title={row.message}>
                      {row.message}
                    </td>
                    <td className="px-4 py-3">{providerStatePresentation(row.emailState).label}</td>
                    <td className="px-4 py-3">{providerStatePresentation(row.crmState).label}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={adminDetailHref("contacts", row.id, contactPagination.page, bookingPagination.page)}
                        className="inline-flex min-h-11 items-center text-ax-cyan-alt hover:underline"
                        aria-label={`View contact details for ${row.name}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          label="Contact submissions"
          kind="contacts"
          pagination={contactPagination}
          contactPage={contactPagination.page}
          bookingPage={bookingPagination.page}
        />
      </section>

      <section>
        <h2 className="mb-1 text-xl font-bold">Strategy call requests</h2>
        <p className="mb-5 text-sm text-ax-text-muted">Newest requests first. Times are shown in UTC.</p>
        <div className="overflow-x-auto rounded-lg border border-ax-border-subtle">
          <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ax-border-subtle bg-white/[0.02]">
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Requested slot</th>
                <th className="px-4 py-3 font-semibold">Calendly</th>
                <th className="px-4 py-3 font-semibold">Email notification</th>
                <th className="px-4 py-3 font-semibold">CRM sync</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-ax-text-muted">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                bookings.map((row) => (
                  <tr key={row.id} className="border-b border-ax-border-subtle last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-ax-text-muted">{formatAdminDate(row.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-ax-text-muted">{formatAdminDate(row.updatedAt)}</td>
                    <td className="max-w-[220px] break-words px-4 py-3">{row.name}</td>
                    <td className="max-w-[220px] break-words px-4 py-3">{row.company}</td>
                    <td className="max-w-[260px] break-all px-4 py-3">{row.email}</td>
                    <td className="max-w-[260px] break-words px-4 py-3">{row.slotLabel}</td>
                    <td className="px-4 py-3">
                      {calendlyStatePresentation({ status: row.status, hasCorrelation: row.hasCalendarCorrelation, confirmedAt: null }).label}
                    </td>
                    <td className="px-4 py-3">{providerStatePresentation(row.emailState).label}</td>
                    <td className="px-4 py-3">{providerStatePresentation(row.crmState).label}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={adminDetailHref("bookings", row.id, contactPagination.page, bookingPagination.page)}
                        className="inline-flex min-h-11 items-center text-ax-cyan-alt hover:underline"
                        aria-label={`View booking details for ${row.name}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          label="Strategy call requests"
          kind="bookings"
          pagination={bookingPagination}
          contactPage={contactPagination.page}
          bookingPage={bookingPagination.page}
        />
      </section>
    </div>
  );
}
