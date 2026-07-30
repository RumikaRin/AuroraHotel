import { db as defaultDb } from "../lib/db.ts";
import { ConflictError, NotFoundError, ValidationError } from "../domain/errors.ts";
import { recordAuditLog } from "./audit.service.ts";

export interface AssignRoomParams {
  bookingId: string;
  roomId: string;
  staffId?: string;
  notes?: string;
}

export async function assignRoomToBooking(
  params: AssignRoomParams,
  client = defaultDb,
) {
  const booking = await client.booking.findUnique({
    where: { id: params.bookingId },
  });
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const room = await client.room.findUnique({
    where: { id: params.roomId },
  });
  if (!room) {
    throw new NotFoundError("Room not found");
  }

  if (room.roomCategoryId !== booking.roomCategoryId) {
    throw new ValidationError("Room category does not match booking category");
  }

  const assignment = await client.roomAssignment.create({
    data: {
      bookingId: params.bookingId,
      roomId: params.roomId,
      assignedBy: params.staffId,
      notes: params.notes,
    },
  });

  await recordAuditLog(
    {
      actorId: params.staffId,
      bookingId: params.bookingId,
      action: "ROOM_ASSIGNED",
      entityType: "RoomAssignment",
      entityId: assignment.id,
      payload: { roomNumber: room.number },
    },
    client,
  );

  return assignment;
}

export interface UpdateCleaningParams {
  roomId: string;
  status: "CLEAN" | "DIRTY" | "INSPECTING" | "MAINTENANCE";
  staffId?: string;
  notes?: string;
}

export async function updateRoomCleaningStatus(
  params: UpdateCleaningParams,
  client = defaultDb,
) {
  const room = await client.room.findUnique({
    where: { id: params.roomId },
  });
  if (!room) {
    throw new NotFoundError("Room not found");
  }

  const updated = await client.room.update({
    where: { id: params.roomId },
    data: {
      status: params.status,
      notes: params.notes ?? room.notes,
    },
  });

  await recordAuditLog(
    {
      actorId: params.staffId,
      action: "ROOM_STATUS_CHANGED",
      entityType: "Room",
      entityId: params.roomId,
      payload: { previousStatus: room.status, newStatus: params.status },
    },
    client,
  );

  return updated;
}

export async function performCheckIn(
  params: { bookingId: string; staffId?: string },
  client = defaultDb,
) {
  const booking = await client.booking.findUnique({
    where: { id: params.bookingId },
  });
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const { count } = await client.booking.updateMany({
    where: {
      id: params.bookingId,
      status: "CONFIRMED",
    },
    data: { status: "CHECKED_IN" },
  });

  if (count !== 1) {
    throw new ConflictError(`Cannot check in booking ${params.bookingId}: status must be CONFIRMED (current: ${booking.status})`);
  }

  await recordAuditLog(
    {
      actorId: params.staffId,
      bookingId: params.bookingId,
      action: "GUEST_CHECKED_IN",
      entityType: "Booking",
      entityId: params.bookingId,
    },
    client,
  );

  return client.booking.findUnique({ where: { id: params.bookingId } });
}

export async function performCheckOut(
  params: { bookingId: string; staffId?: string },
  client = defaultDb,
) {
  const booking = await client.booking.findUnique({
    where: { id: params.bookingId },
    include: { roomAssignments: true },
  });
  if (!booking) {
    throw new NotFoundError("Booking not found");
  }

  const { count } = await client.booking.updateMany({
    where: {
      id: params.bookingId,
      status: "CHECKED_IN",
    },
    data: { status: "CHECKED_OUT" },
  });

  if (count !== 1) {
    throw new ConflictError(`Cannot check out booking ${params.bookingId}: status must be CHECKED_IN (current: ${booking.status})`);
  }

  const assignedRoomIds = (booking.roomAssignments ?? []).map((ra: { roomId: string }) => ra.roomId);
  if (assignedRoomIds.length > 0) {
    await client.room.updateMany({
      where: { id: { in: assignedRoomIds } },
      data: { status: "DIRTY" },
    });
  }

  await recordAuditLog(
    {
      actorId: params.staffId,
      bookingId: params.bookingId,
      action: "GUEST_CHECKED_OUT",
      entityType: "Booking",
      entityId: params.bookingId,
      payload: { assignedRoomIds },
    },
    client,
  );

  return client.booking.findUnique({ where: { id: params.bookingId } });
}

