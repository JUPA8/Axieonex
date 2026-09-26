# Admin operations

The administration interface is protected by the existing Auth.js session and
active-admin revalidation. Every dashboard read, detail read, and article
mutation checks that the administrator still exists and is active. Deleted,
inactive, unauthenticated, and stale sessions are redirected to
`/admin/login` before protected data is read.

## Data views

- `/admin` lists contacts and bookings in stable newest-first order. Each list
  has independent server-side pagination with a fixed page size of 20.
- `contactsPage` and `bookingsPage` accept integers from 1 through 10000.
  Invalid values normalize to page 1; values beyond the available data clamp
  to the final page. Previous and Next links preserve the other table's page.
- `/admin/contacts/[id]` displays safe operational contact fields, the complete
  message with line breaks preserved, timestamps, and email/CRM states.
- `/admin/bookings/[id]` displays safe operational booking fields, pending or
  confirmed Calendly evidence, timestamps, and email/CRM states.
- Detail links preserve both dashboard page values for the return link.
- `/admin/articles` shows draft/published status and creation/update times.
- All displayed dates are explicitly formatted in UTC.

IP addresses, raw Calendly correlation and invitee identifiers, credentials,
session values, CAPTCHA data, webhook secrets, provider responses, stack
traces, and internal database details are not rendered. Submitted text is
rendered as text, never as HTML.

## Provider states

Email and CRM operations use these persisted states:

| State | Meaning |
|---|---|
| `NOT_ATTEMPTED` | A new record exists but the applicable provider operation has not run. |
| `DISABLED` | The provider was not configured, so no external request was made. |
| `SUCCEEDED` | A matching durable success timestamp proves completion. |
| `FAILED` | A configured or partially configured operation did not complete successfully. No raw failure response is stored. |
| `LEGACY_UNKNOWN` | A historical row has no success timestamp, so its earlier outcome cannot be inferred. |

Calendly status is based on the existing booking status and stored evidence.
`CONFIRMED` means a verified webhook completed the transition. `PENDING` with a
server-generated correlation record is awaiting that webhook. A historical
pending row without correlation evidence is shown as legacy/unknown.

## Migration and failure behavior

Migration `20260925120000_admin_operational_completeness` adds `updatedAt` and
provider-state columns to contacts and bookings. Existing success timestamps
are preserved and backfilled as `SUCCEEDED`; historical null success timestamps
become `LEGACY_UNKNOWN`, never inferred failures. Each historical `updatedAt`
is deterministically set to the latest applicable stored timestamp. New rows
default to `NOT_ATTEMPTED`, and Prisma updates `updatedAt` on later writes.

The dashboard has a protected loading state and a generic recoverable error
boundary. The boundary reports the exception through the existing optional
Sentry integration and offers a retry without displaying the exception,
record data, query details, or infrastructure information. Authentication
failures are handled by the layout redirect and are not presented as data
errors.

This repair was developed and tested with disposable local PostgreSQL and
synthetic records. Provider credentials remained absent and no email, CRM,
Calendly, hosting, DNS, or production service was contacted.
