import Link from "next/link";
import type { AdminPagination as PaginationState } from "@/lib/adminPagination";
import { adminDashboardHref } from "@/lib/adminPagination";

export function AdminPagination({
  label,
  kind,
  pagination,
  contactPage,
  bookingPage,
}: {
  label: string;
  kind: "contacts" | "bookings";
  pagination: PaginationState;
  contactPage: number;
  bookingPage: number;
}) {
  const hrefFor = (page: number) =>
    adminDashboardHref(kind === "contacts" ? page : contactPage, kind === "bookings" ? page : bookingPage);
  const controlClass = "inline-flex min-h-11 items-center rounded-sm border border-ax-border-default px-4 py-2 text-sm";

  return (
    <nav aria-label={`${label} pagination`} className="mt-4 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-ax-text-muted">
        Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} total
      </p>
      <div className="flex items-center gap-3">
        {pagination.hasPreviousPage ? (
          <Link className={`${controlClass} text-ax-text-primary hover:border-ax-text-primary`} href={hrefFor(pagination.page - 1)}>
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={`${controlClass} cursor-not-allowed text-ax-text-muted opacity-60`}>
            Previous
          </span>
        )}
        <span aria-current="page" className="text-sm text-ax-text-muted">
          {pagination.page}
        </span>
        {pagination.hasNextPage ? (
          <Link className={`${controlClass} text-ax-text-primary hover:border-ax-text-primary`} href={hrefFor(pagination.page + 1)}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={`${controlClass} cursor-not-allowed text-ax-text-muted opacity-60`}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
