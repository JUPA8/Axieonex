import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin | AXIEONEX",
  robots: { index: false, follow: false },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function AdminDashboardPage() {
  const [contacts, bookings] = await Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <section>
        <h1 className="mb-1 text-xl font-bold">Contact submissions</h1>
        <p className="mb-5 text-sm text-ax-text-muted">{contacts.length} total</p>
        <div className="overflow-x-auto rounded-lg border border-ax-border-subtle">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ax-border-subtle bg-white/[0.02]">
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Email sent</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ax-text-muted">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                contacts.map((row) => (
                  <tr key={row.id} className="border-b border-ax-border-subtle last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-ax-text-muted">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">{row.purpose}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="max-w-[320px] truncate px-4 py-3" title={row.message}>
                      {row.message}
                    </td>
                    <td className="px-4 py-3">{row.emailSentAt ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h1 className="mb-1 text-xl font-bold">Strategy call requests</h1>
        <p className="mb-5 text-sm text-ax-text-muted">{bookings.length} total</p>
        <div className="overflow-x-auto rounded-lg border border-ax-border-subtle">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ax-border-subtle bg-white/[0.02]">
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Requested slot</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Email sent</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-ax-text-muted">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                bookings.map((row) => (
                  <tr key={row.id} className="border-b border-ax-border-subtle last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-ax-text-muted">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.company}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.slotLabel}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">{row.emailSentAt ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
