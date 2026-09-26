-- CreateEnum
CREATE TYPE "ProviderOperationState" AS ENUM (
    'NOT_ATTEMPTED',
    'DISABLED',
    'SUCCEEDED',
    'FAILED',
    'LEGACY_UNKNOWN'
);

-- Add nullable columns first so existing rows can be backfilled without
-- inventing outcomes. A success timestamp is durable evidence of success;
-- an absent timestamp on historical data is explicitly unknown.
ALTER TABLE "contact_submissions"
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "emailState" "ProviderOperationState",
ADD COLUMN "emailStateUpdatedAt" TIMESTAMP(3),
ADD COLUMN "crmState" "ProviderOperationState",
ADD COLUMN "crmStateUpdatedAt" TIMESTAMP(3);

UPDATE "contact_submissions"
SET
    "updatedAt" = GREATEST(
        "createdAt",
        COALESCE("emailSentAt", "createdAt"),
        COALESCE("crmSyncedAt", "createdAt")
    ),
    "emailState" = CASE
        WHEN "emailSentAt" IS NOT NULL THEN 'SUCCEEDED'::"ProviderOperationState"
        ELSE 'LEGACY_UNKNOWN'::"ProviderOperationState"
    END,
    "emailStateUpdatedAt" = "emailSentAt",
    "crmState" = CASE
        WHEN "crmSyncedAt" IS NOT NULL THEN 'SUCCEEDED'::"ProviderOperationState"
        ELSE 'LEGACY_UNKNOWN'::"ProviderOperationState"
    END,
    "crmStateUpdatedAt" = "crmSyncedAt";

ALTER TABLE "contact_submissions"
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "emailState" SET DEFAULT 'NOT_ATTEMPTED',
ALTER COLUMN "emailState" SET NOT NULL,
ALTER COLUMN "crmState" SET DEFAULT 'NOT_ATTEMPTED',
ALTER COLUMN "crmState" SET NOT NULL;

ALTER TABLE "booking_requests"
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "emailState" "ProviderOperationState",
ADD COLUMN "emailStateUpdatedAt" TIMESTAMP(3),
ADD COLUMN "crmState" "ProviderOperationState",
ADD COLUMN "crmStateUpdatedAt" TIMESTAMP(3);

UPDATE "booking_requests"
SET
    "updatedAt" = GREATEST(
        "createdAt",
        COALESCE("confirmedAt", "createdAt"),
        COALESCE("emailSentAt", "createdAt"),
        COALESCE("crmSyncedAt", "createdAt")
    ),
    "emailState" = CASE
        WHEN "emailSentAt" IS NOT NULL THEN 'SUCCEEDED'::"ProviderOperationState"
        ELSE 'LEGACY_UNKNOWN'::"ProviderOperationState"
    END,
    "emailStateUpdatedAt" = "emailSentAt",
    "crmState" = CASE
        WHEN "crmSyncedAt" IS NOT NULL THEN 'SUCCEEDED'::"ProviderOperationState"
        ELSE 'LEGACY_UNKNOWN'::"ProviderOperationState"
    END,
    "crmStateUpdatedAt" = "crmSyncedAt";

ALTER TABLE "booking_requests"
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "emailState" SET DEFAULT 'NOT_ATTEMPTED',
ALTER COLUMN "emailState" SET NOT NULL,
ALTER COLUMN "crmState" SET DEFAULT 'NOT_ATTEMPTED',
ALTER COLUMN "crmState" SET NOT NULL;
