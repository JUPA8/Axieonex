-- AlterTable
ALTER TABLE "admins" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "booking_requests"
ADD COLUMN "calendarCorrelationId" TEXT,
ADD COLUMN "calendarInviteeUid" TEXT,
ADD COLUMN "confirmedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "booking_requests_calendarCorrelationId_key" ON "booking_requests"("calendarCorrelationId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_requests_calendarInviteeUid_key" ON "booking_requests"("calendarInviteeUid");
