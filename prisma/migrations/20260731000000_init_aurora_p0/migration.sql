-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "maxOccupancy" INTEGER NOT NULL DEFAULT 2,
    "sizeSqm" INTEGER NOT NULL DEFAULT 35,
    "bedConfiguration" TEXT NOT NULL DEFAULT '1 King Bed',
    "amenities" JSONB NOT NULL,
    "images" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatePlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roomCategoryId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "priceMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "cancelPolicyDays" INTEGER NOT NULL DEFAULT 3,
    "breakfastIncluded" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "roomCategoryId" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'CLEAN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayAvailability" (
    "id" TEXT NOT NULL,
    "roomCategoryId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalInventory" INTEGER NOT NULL DEFAULT 10,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "holdCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "guestId" TEXT,
    "ratePlanId" TEXT NOT NULL,
    "roomCategoryId" TEXT NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "nights" INTEGER NOT NULL,
    "numGuests" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomAssignment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "RoomAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "gatewayPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "bookingId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutIdempotency" (
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutIdempotency_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_type_key" ON "Role"("type");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomCategory_slug_key" ON "RoomCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RoomCategory_type_key" ON "RoomCategory"("type");

-- CreateIndex
CREATE INDEX "RoomCategory_isActive_idx" ON "RoomCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RatePlan_code_key" ON "RatePlan"("code");

-- CreateIndex
CREATE INDEX "RatePlan_roomCategoryId_idx" ON "RatePlan"("roomCategoryId");

-- CreateIndex
CREATE INDEX "RatePlan_isActive_idx" ON "RatePlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Room_number_key" ON "Room"("number");

-- CreateIndex
CREATE INDEX "Room_roomCategoryId_idx" ON "Room"("roomCategoryId");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "DayAvailability_date_idx" ON "DayAvailability"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DayAvailability_roomCategoryId_date_key" ON "DayAvailability"("roomCategoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "Booking_guestId_idx" ON "Booking"("guestId");

-- CreateIndex
CREATE INDEX "Booking_roomCategoryId_idx" ON "Booking"("roomCategoryId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_checkIn_checkOut_idx" ON "Booking"("checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "RoomAssignment_bookingId_idx" ON "RoomAssignment"("bookingId");

-- CreateIndex
CREATE INDEX "RoomAssignment_roomId_idx" ON "RoomAssignment"("roomId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_bookingId_idx" ON "AuditLog"("bookingId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailOutbox_status_createdAt_idx" ON "EmailOutbox"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CheckoutIdempotency_userId_idx" ON "CheckoutIdempotency"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayAvailability" ADD CONSTRAINT "DayAvailability_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAssignment" ADD CONSTRAINT "RoomAssignment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAssignment" ADD CONSTRAINT "RoomAssignment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
