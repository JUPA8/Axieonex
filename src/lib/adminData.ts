import "server-only";

import { requireAdmin } from "@/lib/adminAuthorization";
import { createAdminPagination } from "@/lib/adminPagination";
import { isValidAdminRecordId } from "@/lib/adminPresentation";
import { prisma } from "@/lib/prisma";

export async function getAdminSubmissions(requestedContactPage = 1, requestedBookingPage = 1) {
  await requireAdmin();
  return prisma.$transaction(
    async (transaction) => {
      const [contactCount, bookingCount] = await Promise.all([
        transaction.contactSubmission.count(),
        transaction.bookingRequest.count(),
      ]);
      const contactPagination = createAdminPagination(contactCount, requestedContactPage);
      const bookingPagination = createAdminPagination(bookingCount, requestedBookingPage);
      const [contacts, bookings] = await Promise.all([
        transaction.contactSubmission.findMany({
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (contactPagination.page - 1) * contactPagination.pageSize,
          take: contactPagination.pageSize,
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            purpose: true,
            name: true,
            email: true,
            message: true,
            emailState: true,
            crmState: true,
          },
        }),
        transaction.bookingRequest.findMany({
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (bookingPagination.page - 1) * bookingPagination.pageSize,
          take: bookingPagination.pageSize,
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            name: true,
            company: true,
            email: true,
            slotLabel: true,
            status: true,
            calendarCorrelationId: true,
            emailState: true,
            crmState: true,
          },
        }),
      ]);

      return {
        contacts,
        bookings: bookings.map(({ calendarCorrelationId, ...booking }) => ({
          ...booking,
          hasCalendarCorrelation: Boolean(calendarCorrelationId),
        })),
        contactPagination,
        bookingPagination,
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}

export async function getAdminContact(id: string) {
  await requireAdmin();
  if (!isValidAdminRecordId(id)) return null;
  return prisma.contactSubmission.findUnique({
    where: { id },
    select: {
      purpose: true,
      name: true,
      email: true,
      company: true,
      message: true,
      createdAt: true,
      updatedAt: true,
      emailSentAt: true,
      emailState: true,
      emailStateUpdatedAt: true,
      crmSyncedAt: true,
      crmState: true,
      crmStateUpdatedAt: true,
    },
  });
}

export async function getAdminBooking(id: string) {
  await requireAdmin();
  if (!isValidAdminRecordId(id)) return null;
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    select: {
      name: true,
      email: true,
      phone: true,
      role: true,
      company: true,
      website: true,
      country: true,
      size: true,
      approach: true,
      outcome: true,
      market: true,
      budget: true,
      slotId: true,
      slotLabel: true,
      status: true,
      calendarBookingUid: true,
      calendarCorrelationId: true,
      calendarInviteeUid: true,
      confirmedAt: true,
      createdAt: true,
      updatedAt: true,
      emailSentAt: true,
      emailState: true,
      emailStateUpdatedAt: true,
      crmSyncedAt: true,
      crmState: true,
      crmStateUpdatedAt: true,
    },
  });
  if (!booking) return null;
  const { calendarCorrelationId, calendarInviteeUid, ...operationalFields } = booking;
  return {
    ...operationalFields,
    hasCalendarCorrelation: Boolean(calendarCorrelationId),
    hasCalendarInvitee: Boolean(calendarInviteeUid),
  };
}

export async function getAdminArticles() {
  await requireAdmin();
  return prisma.article.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminArticle(id: string) {
  await requireAdmin();
  return prisma.article.findUnique({ where: { id } });
}
