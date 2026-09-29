export const ADMIN_PAGE_SIZE = 20;
const MAX_PAGE_PARAMETER = 10_000;

export type AdminPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function parseAdminPage(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= MAX_PAGE_PARAMETER ? parsed : 1;
}

export function createAdminPagination(totalItems: number, requestedPage: number): AdminPagination {
  const safeTotal = Number.isSafeInteger(totalItems) && totalItems > 0 ? totalItems : 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / ADMIN_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return {
    page,
    pageSize: ADMIN_PAGE_SIZE,
    totalItems: safeTotal,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function adminDashboardHref(contactPage: number, bookingPage: number): string {
  const query = new URLSearchParams();
  if (contactPage > 1) query.set("contactsPage", String(contactPage));
  if (bookingPage > 1) query.set("bookingsPage", String(bookingPage));
  const suffix = query.toString();
  return suffix ? `/admin?${suffix}` : "/admin";
}

export function adminDetailHref(
  recordType: "contacts" | "bookings",
  id: string,
  contactPage: number,
  bookingPage: number,
): string {
  const dashboardHref = adminDashboardHref(contactPage, bookingPage);
  const queryIndex = dashboardHref.indexOf("?");
  const query = queryIndex >= 0 ? dashboardHref.slice(queryIndex) : "";
  return `/admin/${recordType}/${encodeURIComponent(id)}${query}`;
}
