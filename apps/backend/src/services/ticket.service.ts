import { Prisma, ServiceStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ConflictError, NotFoundError } from "../errors/AppError";

/**
 * Ticket lifecycle (enforced here, not in the UI):
 *
 *   PREPARING --(/status)--> LIGHT | TRAY | CART --(/complete)--> COMPLETED
 *
 * Each transition is ONE atomic UPDATE with the expected current state in the
 * WHERE clause. If two devices act on the same ticket at the same time, the
 * database lets exactly one of them through; the other one gets a 409.
 */

export type DeliveryStatus = Extract<ServiceStatus, "LIGHT" | "TRAY" | "CART">;

const DELIVERED_STATUSES = [
  ServiceStatus.LIGHT,
  ServiceStatus.TRAY,
  ServiceStatus.CART,
];

function isRecordNotFound(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

// The atomic update matched nothing: either the ticket doesn't exist (404)
// or it isn't in the state this transition needs (409).
async function failedTransitionError(id: string, message: string) {
  const ticket = await prisma.serviceTicket.findUnique({ where: { id } });

  if (!ticket) {
    return new NotFoundError("Ticket not found");
  }

  return new ConflictError(`${message} (current status: ${ticket.status})`);
}

export async function createTicket(roomNumber: number) {
  return prisma.serviceTicket.create({
    data: {
      roomNumber
    }
  });
}

export async function getActiveTickets() {
  return prisma.serviceTicket.findMany({
    where: {
      completedAt: null
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

// PREPARING -> LIGHT | TRAY | CART
export async function updateTicketStatus(id: string, status: DeliveryStatus) {
  try {
    return await prisma.serviceTicket.update({
      where: { id, status: ServiceStatus.PREPARING },
      data: { status, deliveredAt: new Date() }
    });
  } catch (err) {
    if (!isRecordNotFound(err)) throw err;
    throw await failedTransitionError(
      id,
      "Only tickets in PREPARING can be delivered"
    );
  }
}

// LIGHT | TRAY | CART -> COMPLETED
export async function completeTicket(id: string) {
  try {
    return await prisma.serviceTicket.update({
      where: { id, status: { in: DELIVERED_STATUSES } },
      data: { status: ServiceStatus.COMPLETED, completedAt: new Date() }
    });
  } catch (err) {
    if (!isRecordNotFound(err)) throw err;
    throw await failedTransitionError(
      id,
      "Only delivered tickets (LIGHT, TRAY or CART) can be completed"
    );
  }
}
