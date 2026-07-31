-- AlterTable
ALTER TABLE "DayAvailability" ADD COLUMN     "blockedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serviceTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discountTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxAndFeeTotal" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "InventoryBlock" (
    "id" TEXT NOT NULL,
    "roomCategoryId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "blockedQuantity" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingRoom" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "roomCategoryId" TEXT NOT NULL,
    "ratePlanId" TEXT,
    "pricePerNight" INTEGER NOT NULL,
    "numGuests" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingNight" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingRoomId" TEXT,
    "date" DATE NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "finalPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingNight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingGuest" (
    "id" TEXT NOT NULL,
    "bookingRoomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PER_STAY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingService" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "roomCategoryIds" JSONB,
    "ratePlanIds" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "minBookingAmount" INTEGER NOT NULL DEFAULT 0,
    "maxDiscountAmount" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxUsageTotal" INTEGER NOT NULL DEFAULT 100,
    "maxUsagePerUser" INTEGER NOT NULL DEFAULT 1,
    "currentUsageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT,
    "discountApplied" INTEGER NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "eventPayload" JSONB,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "transactionRef" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE UNIQUE INDEX "CouponUsage_bookingId_key" ON "CouponUsage"("bookingId");
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");

-- CreateIndex
CREATE INDEX "InventoryBlock_roomCategoryId_idx" ON "InventoryBlock"("roomCategoryId");
CREATE INDEX "InventoryBlock_startDate_endDate_idx" ON "InventoryBlock"("startDate", "endDate");
CREATE INDEX "BookingRoom_bookingId_idx" ON "BookingRoom"("bookingId");
CREATE INDEX "BookingRoom_roomCategoryId_idx" ON "BookingRoom"("roomCategoryId");
CREATE INDEX "BookingNight_bookingId_idx" ON "BookingNight"("bookingId");
CREATE INDEX "BookingNight_bookingRoomId_idx" ON "BookingNight"("bookingRoomId");
CREATE INDEX "BookingNight_date_idx" ON "BookingNight"("date");
CREATE INDEX "BookingGuest_bookingRoomId_idx" ON "BookingGuest"("bookingRoomId");
CREATE INDEX "Service_isActive_idx" ON "Service"("isActive");
CREATE INDEX "BookingService_bookingId_idx" ON "BookingService"("bookingId");
CREATE INDEX "BookingService_serviceId_idx" ON "BookingService"("serviceId");
CREATE INDEX "Promotion_isActive_idx" ON "Promotion"("isActive");
CREATE INDEX "Promotion_startDate_endDate_idx" ON "Promotion"("startDate", "endDate");
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");
CREATE INDEX "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");
CREATE INDEX "CouponUsage_userId_idx" ON "CouponUsage"("userId");
CREATE INDEX "PaymentEvent_paymentId_idx" ON "PaymentEvent"("paymentId");
CREATE INDEX "PaymentEvent_createdAt_idx" ON "PaymentEvent"("createdAt");
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");
CREATE INDEX "Refund_bookingId_idx" ON "Refund"("bookingId");
CREATE INDEX "Refund_status_idx" ON "Refund"("status");

-- AddForeignKey
ALTER TABLE "InventoryBlock" ADD CONSTRAINT "InventoryBlock_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "RoomCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookingRoom" ADD CONSTRAINT "BookingRoom_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingNight" ADD CONSTRAINT "BookingNight_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingNight" ADD CONSTRAINT "BookingNight_bookingRoomId_fkey" FOREIGN KEY ("bookingRoomId") REFERENCES "BookingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingGuest" ADD CONSTRAINT "BookingGuest_bookingRoomId_fkey" FOREIGN KEY ("bookingRoomId") REFERENCES "BookingRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
